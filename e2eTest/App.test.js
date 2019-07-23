import test from 'ava'
import { startBackgroundProcess } from './util'
const dappeteer = require('dappeteer')
import puppeteer from 'puppeteer'
const { percySnapshot } = require('@percy/puppeteer')

test.before(async t => {
  const browser = await dappeteer.launch(puppeteer, {
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  })
  const page = await browser.newPage()
  const metamask = await dappeteer.getMetamask(browser)
  const { stdout, exit } = await startBackgroundProcess({
    cmd: 'npm',
    args: ['run', 'start:template'],
    execaOpts: {
      cwd: `./`,
    },
    readyOutput: 'Opening http://localhost:3000/#/'
  })

  // hack so the wrapper has time to start
  await new Promise(resolve => setTimeout(resolve, 60 * 1000)) // TODO move to utils

  // finding the DAO address
  const daoAddress = stdout.match(/DAO address: (0x[a-fA-F0-9]{40})/)[1]

  const { stdoutScript, exitScript } = await startBackgroundProcess({
    cmd: 'npm',
    args: ['run', 'deploy-tokens', daoAddress],
    execaOpts: {
      cwd: `./`,
    },
    readyOutput: 'ETH 0x0000000000000000000000000000000000000000',
  })
  await metamask.switchNetwork('localhost')
  await metamask.importPK('a8a54b2d8197bc0b19bb8a084031be71835580a01e70a45a13babd16c9bc1563')
  await metamask.switchAccount(2)

  t.context = {
    browser: browser,
    page: page,
    daoAddress: daoAddress,
    metamask: metamask,
    exit: exit,
  }
})

test.serial('should display initial screen ', async t => {
  const redemptionsText = 'Redemptions'
  let addTokenText
  const url = `http://localhost:3000/#/${t.context.daoAddress}`
  await t.context.page.goto(url)
  await t.context.page.reload()
  await t.context.page.bringToFront()
  await t.context.page.waitForFunction(
    redemptionsText => document.querySelector('body').innerText.includes(redemptionsText),
    {},
    redemptionsText
  )
  const RedemptionsAppSpan = await t.context.page.$x("//span[contains(text(), 'Redemptions')]")
  if (RedemptionsAppSpan.length > 0) {
    await RedemptionsAppSpan[0].click()
    await t.context.page.waitFor(3000)
  } else {
    throw new Error('Redemptions app not found')
  }

  const frame = await t.context.page.frames().find(f => f.name() === 'AppIFrame')
  const addTokenButton = await frame.$x("//button[contains(text(), 'Add token')]")
  if (addTokenButton.length > 0) {
    const button = addTokenButton[0]
    addTokenText = await frame.evaluate(button => button.textContent, button)
  }
  await percySnapshot(frame, 'Initial Screen')
  t.is(addTokenText, 'Add token')
})

test.serial('should display add token side panel and create transaction', async t => {
  let addTokenText
  const frame = await t.context.page.frames().find(f => f.name() === 'AppIFrame')
  const addTokenButton = await frame.$x("//button[contains(text(), 'Add token')]")

  if (addTokenButton.length > 0) {
    await addTokenButton[0].click()
    await frame.type('input[name=address]', '0x0000000000000000000000000000000000000000', { delay: 20 })
    await frame.waitForSelector('#SidePanelButton')
    const AddTokenSidePanelButton = await frame.$('#SidePanelButton')
    addTokenText = await frame.evaluate(
      AddTokenSidePanelButton => AddTokenSidePanelButton.textContent,
      AddTokenSidePanelButton
    )
    //Percy
    await percySnapshot(frame, 'Side Panel')
    await AddTokenSidePanelButton.click()
    await t.context.page.waitFor(4000)
  } else {
    throw new Error('Add token button not found')
  }
  t.is(addTokenText, 'Add token')
})

test.serial('should confirm create transaction and vote', async t => {
  const createTransaction = await t.context.page.$x("//button[contains(text(), 'Create transaction')]")
  let viewVoteButton
  let viewVoteText
  const votingText = 'Voting'

  if (createTransaction.length > 0) {
    await createTransaction[0].click()
    await t.context.metamask.confirmTransaction()
    await t.context.page.waitFor(3000)
    await t.context.page.bringToFront()
    await t.context.page.waitForFunction(
      votingText => document.querySelector('body').innerText.includes(votingText),
      {},
      votingText
    )
    const votingAppSpan = await t.context.page.$x("//span[contains(text(), 'Voting')]")

    if (votingAppSpan.length > 0) {
      await votingAppSpan[0].click()
      await t.context.page.waitFor(3000)
      const votingFrame = await t.context.page.frames().find(f => f.name() === 'AppIFrame')
      const viewVote = await votingFrame.$x("//button[contains(text(), 'View vote')]")

      if (viewVote.length > 0) {
        viewVoteButton = viewVote[0]
        viewVoteText = await votingFrame.evaluate(viewVoteButton => viewVoteButton.textContent, viewVoteButton)
        await viewVoteButton.click()
        await t.context.page.waitFor(3000)
        const voteYes = await votingFrame.$x("//button[contains(text(), 'Yes')]")
        if (voteYes.length > 0) {
          voteYes[0].click()
          await t.context.page.waitFor(3000)
          const createVotingTransaction = await t.context.page.$x("//button[contains(text(), 'Create transaction')]")

          if (createVotingTransaction.length > 0) {
            await createVotingTransaction[0].click()
            await t.context.metamask.confirmTransaction()
            await t.context.page.waitFor(3000)
            await t.context.page.bringToFront()
          } else {
            throw new Error('Create transaction not found')
          }
        } else {
          throw new Error('Vote Yes button  not found')
        }
      } else {
        throw new Error('View vote button  not found')
      }
    } else {
      throw new Error('Voting app  not found')
    }
  }
  t.is(viewVoteText, 'View vote')
})

test.serial('should add the token ', async t => {
  let RedemptionsListTitle
  let ETHDiv
  let ETHTitle
  let frame
  const RedemptionsAppSpan = await t.context.page.$x("//span[contains(text(), 'Redemptions')]")

  if (RedemptionsAppSpan.length > 0) {
    await RedemptionsAppSpan[0].click()
    await t.context.page.waitFor(3000)
    frame = await t.context.page.frames().find(f => f.name() === 'AppIFrame')
    RedemptionsListTitle = await frame.evaluate(el => el.innerHTML, await frame.$('#TokensTitle'))
    ETHDiv = await frame.waitForSelector('#ETHTitle')
    ETHTitle = await frame.evaluate(ETHDiv => ETHDiv.textContent, ETHDiv)

  } else {
    throw new Error('Redemptions app not found')
  }

  await percySnapshot(frame, 'Token List')
  t.is(RedemptionsListTitle, 'Tokens for redemption')
  t.is(ETHTitle, 'ETH')
  await t.context.exit()
})
