import DaoDeployment from './helpers/DaoDeployment'
const Redemptions = artifacts.require('Redemptions')
const TokenManager = artifacts.require('TokenManager')
const Vault = artifacts.require('Vault')
const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory')
const MiniMeToken = artifacts.require('MiniMeToken')
const Erc20 = artifacts.require('ERC20Token')

const { assertRevert, deployedContract, getSeconds } = require('./helpers/helpers')
const { getSignatureFields, sha3, sign } = require('./helpers/web3-helpers')

const ANY_ADDRESS = '0xffffffffffffffffffffffffffffffffffffffff'
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

contract('Redemptions', ([rootAccount, redeemer, ...accounts]) => {
  let daoDeployment = new DaoDeployment()
  let APP_MANAGER_ROLE, REDEEM_ROLE, ADD_TOKEN_ROLE, REMOVE_TOKEN_ROLE
  let TRANSFER_ROLE, MINT_ROLE, ISSUE_ROLE, ASSIGN_ROLE, REVOKE_VESTINGS_ROLE, BURN_ROLE
  let vaultBase, vault, redeemableToken, redemptionsBase, redemptions, tokenManagerBase, tokenManager

  before(async () => {
    await daoDeployment.deployBefore()

    vaultBase = await Vault.new()
    redemptionsBase = await Redemptions.new()
    tokenManagerBase = await TokenManager.new()

    APP_MANAGER_ROLE = await daoDeployment.kernelBase.APP_MANAGER_ROLE()
    REDEEM_ROLE = await redemptionsBase.REDEEM_ROLE()
    ADD_TOKEN_ROLE = await redemptionsBase.ADD_TOKEN_ROLE()
    REMOVE_TOKEN_ROLE = await redemptionsBase.REMOVE_TOKEN_ROLE()

    MINT_ROLE = await tokenManagerBase.MINT_ROLE()
    ISSUE_ROLE = await tokenManagerBase.ISSUE_ROLE()
    ASSIGN_ROLE = await tokenManagerBase.ASSIGN_ROLE()
    REVOKE_VESTINGS_ROLE = await tokenManagerBase.REVOKE_VESTINGS_ROLE()
    BURN_ROLE = await tokenManagerBase.BURN_ROLE()
    TRANSFER_ROLE = await vaultBase.TRANSFER_ROLE()
  })

  beforeEach(async () => {
    await daoDeployment.deployBeforeEach(rootAccount)

    const newVaultAppReceipt = await daoDeployment.kernel.newAppInstance('0x5678', vaultBase.address, '0x', false, {
      from: rootAccount,
    })
    vault = await Vault.at(deployedContract(newVaultAppReceipt))

    const newRedemptionsAppReceipt = await daoDeployment.kernel.newAppInstance(
      '0x1234',
      redemptionsBase.address,
      '0x',
      false,
      {
        from: rootAccount,
      }
    )
    redemptions = await Redemptions.at(deployedContract(newRedemptionsAppReceipt))

    const newTokenManagerAppReceipt = await daoDeployment.kernel.newAppInstance(
      '0x4321',
      tokenManagerBase.address,
      '0x',
      false,
      {
        from: rootAccount,
      }
    )
    tokenManager = await TokenManager.at(deployedContract(newTokenManagerAppReceipt))

    await daoDeployment.acl.createPermission(ANY_ADDRESS, redemptions.address, REDEEM_ROLE, rootAccount, {
      from: rootAccount,
    })
    await daoDeployment.acl.createPermission(ANY_ADDRESS, redemptions.address, ADD_TOKEN_ROLE, rootAccount, {
      from: rootAccount,
    })
    await daoDeployment.acl.createPermission(ANY_ADDRESS, redemptions.address, REMOVE_TOKEN_ROLE, rootAccount, {
      from: rootAccount,
    })

    const miniMeTokenFactory = await MiniMeTokenFactory.new()
    redeemableToken = await MiniMeToken.new(
      miniMeTokenFactory.address,
      ZERO_ADDRESS,
      0,
      'RedeemableToken',
      18,
      'RDT',
      true
    )

    await redeemableToken.changeController(tokenManager.address)

    await tokenManager.initialize(redeemableToken.address, false, 0)
    await vault.initialize()
  })

  context('initialize(Vault _vault, TokenManager _tokenManager)', () => {
    beforeEach(async () => {
      await redemptions.initialize(vault.address, tokenManager.address)
    })

    it('should set initial values correctly', async () => {
      const actualVaultAddress = await redemptions.vault()
      const actualTokenManager = await redemptions.tokenManager()
      const actualTokenAddresses = await redemptions.getTokens()

      assert.strictEqual(actualVaultAddress, vault.address)
      assert.strictEqual(actualTokenManager, tokenManager.address)
      assert.deepStrictEqual(actualTokenAddresses, [])
    })

    context('addToken(address _token)', () => {
      let token0
      let expectedTokenAddresses = []
      it('should add an address to the vault tokens', async () => {
        token0 = await Erc20.new(rootAccount, '', '')
        expectedTokenAddresses.push(token0.address)

        await redemptions.addToken(token0.address)

        const actualTokenAddresses = await redemptions.getTokens()
        const actualTokenAddedToken = await redemptions.tokenAdded(token0.address)
        assert.deepStrictEqual(actualTokenAddresses, expectedTokenAddresses)
        assert.isTrue(actualTokenAddedToken)
      })

      it('reverts if adding token manager', async () => {
        await assertRevert(redemptions.addToken(tokenManager.address), 'REDEMPTIONS_CANNOT_ADD_TOKEN_MANAGER')
      })

      it('reverts if adding already added token', async () => {
        await redemptions.addToken(token0.address)
        await assertRevert(redemptions.addToken(token0.address), 'REDEMPTIONS_TOKEN_ALREADY_ADDED')
      })

      it('reverts if adding non-contract address', async () => {
        await assertRevert(redemptions.addToken(accounts[0]), 'REDEMPTIONS_TOKEN_NOT_CONTRACT')
      })
    })

    context('removeToken(address _token)', () => {
      let token0
      let expectedTokenAddresses

      beforeEach(async () => {
        token0 = await Erc20.new(rootAccount, '', '')
        await redemptions.addToken(token0.address)
        expectedTokenAddresses = [token0.address]
      })
      it('Should remove token address', async () => {
        expectedTokenAddresses = expectedTokenAddresses.slice(1)

        await redemptions.removeToken(token0.address)

        const actualTokenAddresses = await redemptions.getTokens()
        const actualTokenAddedToken = await redemptions.tokenAdded(token0.address)
        assert.deepStrictEqual(actualTokenAddresses, expectedTokenAddresses)
        assert.isFalse(actualTokenAddedToken)
      })

      it('reverts if removing token not present', async () => {
        await assertRevert(redemptions.removeToken(accounts[0]), 'REDEMPTIONS_NOT_VAULT_TOKEN')
      })
    })

    context('redeem(uint256 _amount)', () => {
      let token0, token1

      const rootAccountAmount = 80000
      const redeemerAmount = 20000

      const vaultToken0Amount = 45231
      const vaultToken1Amount = 20001

      const CORRECTMSG = sha3('I WOULD LIKE TO REDEEM SOME TOKENS PLEASE')
      let correctSignature, correctValues

      const INCORRECTMSG = sha3('REDEEM PLEASE')
      let incorrectSignature, incorrectValues

      before(async () => {
        // get hash signatures
        correctSignature = await sign(CORRECTMSG, redeemer)
        correctValues = Object.values(getSignatureFields(correctSignature))
        incorrectSignature = await sign(INCORRECTMSG, redeemer)
        incorrectValues = Object.values(getSignatureFields(incorrectSignature))
      })

      beforeEach(async () => {
        // set permissions
        await daoDeployment.acl.createPermission(rootAccount, tokenManager.address, MINT_ROLE, rootAccount, {
          from: rootAccount,
        })
        await daoDeployment.acl.createPermission(redemptions.address, tokenManager.address, BURN_ROLE, rootAccount, {
          from: rootAccount,
        })
        await daoDeployment.acl.createPermission(redemptions.address, vault.address, TRANSFER_ROLE, rootAccount, {
          from: rootAccount,
        })

        token0 = await Erc20.new(rootAccount, '', '')
        token1 = await Erc20.new(rootAccount, '', '')
        await redemptions.addToken(token0.address)
        await redemptions.addToken(token1.address)

        // transfer tokens to vault
        await token0.transfer(vault.address, vaultToken0Amount)
        await token1.transfer(vault.address, vaultToken1Amount)

        // mint redeemableTokens to first two accounts
        await tokenManager.mint(rootAccount, rootAccountAmount)
        await tokenManager.mint(redeemer, redeemerAmount)
      })

      it('Should redeem tokens as expected', async () => {
        const redeemableTokenTotalSupply = await redeemableToken.totalSupply()
        const expectedRedeemableBalance = 0
        const expectedRedemptionToken0 = parseInt((redeemerAmount * vaultToken0Amount) / redeemableTokenTotalSupply)
        const expectedRedemptionToken1 = parseInt((redeemerAmount * vaultToken1Amount) / redeemableTokenTotalSupply)

        const values = Object.values(correctValues)
        await redemptions.redeem(redeemerAmount, CORRECTMSG, ...values, {
          from: redeemer,
        })

        const actualRedeemableBalance = await tokenManager.spendableBalanceOf(redeemer)
        const actualRedemptionToken0 = await token0.balanceOf(redeemer)
        const actualRedemptionToken1 = await token1.balanceOf(redeemer)

        assert.equal(actualRedeemableBalance, expectedRedeemableBalance)
        assert.equal(actualRedemptionToken0, expectedRedemptionToken0)
        assert.equal(actualRedemptionToken1, expectedRedemptionToken1)
      })

      it('reverts if amount to redeem is zero', async () => {
        await assertRevert(
          redemptions.redeem(0, CORRECTMSG, ...correctValues, {
            from: redeemer,
          }),
          'REDEMPTIONS_CANNOT_REDEEM_ZERO'
        )
      })

      it("reverts if amount to redeem exceeds account's balance", async () => {
        await assertRevert(
          redemptions.redeem(redeemerAmount + 1, CORRECTMSG, ...correctValues, {
            from: redeemer,
          }),
          'REDEMPTIONS_INSUFFICIENT_BALANCE'
        )
      })

      it('reverts if incorrect signed message ', async () => {
        await assertRevert(
          redemptions.redeem(redeemerAmount, INCORRECTMSG, ...incorrectValues, {
            from: redeemer,
          }),
          'REDEMPTIONS_INCORRECT_MESSAGE'
        )
      })

      context('respect vesting', () => {
        const vestingAmount = 200

        let NOW
        let start
        let cliff
        let vesting

        let TIME_TO_CLIFF
        let TIME_TO_VESTING

        beforeEach(async () => {
          await daoDeployment.acl.createPermission(ANY_ADDRESS, tokenManager.address, ISSUE_ROLE, rootAccount, {
            from: rootAccount,
          })
          await daoDeployment.acl.createPermission(ANY_ADDRESS, tokenManager.address, ASSIGN_ROLE, rootAccount, {
            from: rootAccount,
          })
          await daoDeployment.acl.createPermission(ANY_ADDRESS, vault.address, REVOKE_VESTINGS_ROLE, rootAccount, {
            from: rootAccount,
          })

          NOW = getSeconds()
          start = NOW + 2
          cliff = start + 3
          vesting = start + 10

          TIME_TO_CLIFF = cliff - NOW - 1
          TIME_TO_VESTING = vesting - cliff

          await tokenManager.issue(vestingAmount)
          await tokenManager.assignVested(redeemer, vestingAmount, start, cliff, vesting, true)
        })

        // next tests will use setTimeout()
        // we cannot use mock contract in this case because the contract we want to fake its time is not the main one
        it('reverts when redeeming tokens not yet vested', done => {
          setTimeout(async () => {
            await assertRevert(
              redemptions.redeem(redeemerAmount + 1, CORRECTMSG, ...correctValues, {
                from: redeemer,
              }),
              'REDEMPTIONS_INSUFFICIENT_BALANCE'
            )
            done()
          }, TIME_TO_CLIFF * 1000)
        })

        it('should redeem partial amount of vested tokens after cliff', async () => {
          setTimeout(async () => {
            const expectedRedeemableBalance = 0

            await redemptions.redeem(redeemerAmount + 8, CORRECTMSG, ...correctValues, {
              from: redeemer,
            })

            const actualRedeemableBalance = await tokenManager.spendableBalanceOf(redeemer)
            assert.equal(actualRedeemableBalance, expectedRedeemableBalance)
          }, (TIME_TO_CLIFF + 1) * 1000)
        })

        it('should redeem all tokens after vesting', async () => {
          setTimeout(async () => {
            const expectedRedeemableBalance = 0

            await redemptions.redeem(redeemerAmount + vestingAmount, CORRECTMSG, ...correctValues, {
              from: redeemer,
            })

            const actualRedeemableBalance = await tokenManager.spendableBalanceOf(redeemer)
            assert.equal(actualRedeemableBalance, expectedRedeemableBalance)
          }, TIME_TO_VESTING * 1000)
        })
      })
    })
  })
})
