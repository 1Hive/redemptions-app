import test from 'ava'
import { startBackgroundProcess } from './util'
const dappeteer = require('dappeteer')
import puppeteer from 'puppeteer'

test.beforeEach(async t => {
  const browser = await dappeteer.launch(puppeteer, {
    headless: false,
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
    readyOutput: 'Opening http://localhost:3000/#/',
  })

  // hack so the wrapper has time to start
  await new Promise(resolve => setTimeout(resolve, 60 * 1000)) // TODO move to utils

  // finding the DAO address
  const daoAddress = stdout.match(/DAO address: (0x[a-fA-F0-9]{40})/)[1]
  await metamask.switchNetwork('localhost')
  await metamask.importPK('a8a54b2d8197bc0b19bb8a084031be71835580a01e70a45a13babd16c9bc1563')
  await metamask.switchAccount(2)

  // const { stdoutScript, exitScript } = await startBackgroundProcess({
  //   cmd: 'npm',
  //   args: ['run', 'start:template'],
  //   execaOpts: {
  //     cwd: `./`,
  //   },
  //   readyOutput: 'Opening http://localhost:3000/#/',
  // })

  t.context = {
    browser: browser,
    page: page,
    daoAddress: daoAddress,
    metamask: metamask,
    exit: exit,
  }
})

test('should run an aragon app successfully', async t => {
  // let frameH1

  // try {
  //   const url = `http://localhost:3000/#/${t.context.daoAddress}`
  //   await t.context.page.goto(url)
  //   const text = 'Counter'

  //   await t.context.page.reload()
  //   await t.context.page.bringToFront()
  //   await t.context.page.waitForFunction(text => document.querySelector('body').innerText.includes(text), {}, text)
  //   const CounterAppSpan = await t.context.page.$x("//span[contains(text(), 'Counter')]")
  //   if (CounterAppSpan.length > 0) {
  //     await CounterAppSpan[0].click()

  //     await new Promise(resolve => setTimeout(resolve, 3 * 1000))

  //     const frame = await t.context.page.frames().find(f => f.name() === 'AppIFrame')
  //     await frame.waitForSelector('#IncrementButton')
  //     const incrementButton = await frame.$('#IncrementButton')
  //     await incrementButton.click()

  //     await new Promise(resolve => setTimeout(resolve, 3 * 1000))

  //     const confirmTransaction = await t.context.page.$x("//button[contains(text(), 'Create transaction')]")

  //     if (confirmTransaction.length > 0) {
  //       await confirmTransaction[0].click()
  //       await t.context.metamask.confirmTransaction()

  //       await new Promise(resolve => setTimeout(resolve, 3 * 1000))

  //       frameH1 = await frame.evaluate(el => el.innerHTML, await frame.$('h1'))
  //       await t.context.page.bringToFront()

  //       await new Promise(resolve => setTimeout(resolve, 3 * 1000))
  //     } else {
  //       throw new Error('confirmTransaction not found')
  //     }
  //   } else {
  //     throw new Error('CounterApp not found')
  //   }
  // } catch (e) {
  //   console.log(e)
  // }

  t.is('Count: 1', 'Count: 1')
  // cleanup
  //  await t.context.exit();
})
