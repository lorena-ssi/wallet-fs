import Wallet from '../index.js'
import { expect, assert } from 'chai'
import { describe, it } from 'mocha'
import fs from 'fs-extra'
const storage = 'fs'

const deleteWallet = async (w, path) => {
  if (storage === 'fs') {
    fs.removeSync(path)
  } else if (storage === 'mem') {
    w.storage = {}
  }
}

describe('Wallet API', function () {
  const w = new Wallet('testWallet', { storage, silent: true })
  it('should create Wallet class', () => {
    expect(w.info.matrixUser).to.equal('')
  })

  it('should delete the wallet (if any remaining from the last test)', async () => {
    await deleteWallet(w, w.directoryPath)
  })

  it('should add to credentials collection', () => {
    w.add('credentials', { name: 'admintest', role: 'admin' })
    w.add('credentials', { name: 'test1', role: 'user' })
    w.add('credentials', { name: 'test2', role: 'user' })
    w.add('credentials', { name: 'test3', role: 'user' })
    w.add('credentials', { name: 'test4', role: 'user' })
    w.add('credentials', { name: 'test5', role: 'user' })
    expect(w.data.credentials[0]).to.eql({ name: 'admintest', role: 'admin' })
    expect(w.data.credentials[1]).to.eql({ name: 'test1', role: 'user' })
  })

  it('should get the credential', () => {
    const cred = w.get('credentials', { name: 'admintest' })
    expect(cred).to.eql({ name: 'admintest', role: 'admin' })
  })

  it('should update the credential', () => {
    w.update('credentials', { name: 'admintest' }, { name: 'admintest', role: 'superadmin' })
    expect(w.data.credentials[0]).to.eql({ name: 'admintest', role: 'superadmin' })
  })

  it('should save the wallet (lock)', async () => {
    await w.lock('myPassword0')
    expect(w.data.credentials[0]).to.eql({ name: 'admintest', role: 'superadmin' })
  })

  it('should load the wallet (unlock)', async () => {
    const w2 = new Wallet('testWallet', { storage, silent: true })
    await w2.unlock('myPassword0')
    expect(w2.data.credentials[0]).to.eql({ name: 'admintest', role: 'superadmin' })
  })

  it('should remove the credential', () => {
    const name = 'test3'
    w.remove('credentials', { name })
    expect(w.data.credentials[3]).to.eql({ name: 'test4', role: 'user' })
  })

  // At the moment only can search with 1 prop
  xit('should remove only 1', () => {
    const name = 'test4'
    const role = 'user'
    w.remove('credentials', { name, role })
    expect(w.data.credentials[3]).to.eql({ name: 'test5', role: 'user' })
  })

  it('should remove all coincidences', () => {
    const role = 'user'
    w.remove('credentials', { role })
    expect(w.data.credentials.length).to.equal(1)
  })

  it('should remove all coincidences', async () => {
    await w.lock('password0')
  })

  it('should NOT unlock wallet (because it does not exist)', (done) => {
    deleteWallet(w, w.directoryPath).then(() => {
      w.unlock('myPassword0').then((response) => {
        assert(!response)
        done()
      })
    })
  })

  it('should lock new wallet (thus creating it)', (done) => {
    deleteWallet(w, w.directoryPath).then(() => {
      w.lock('myPassword1').then((response) => {
        assert(response)
        done()
      })
    })
  })

  it('should lock existing wallet with correct password', (done) => {
    w.lock('myPassword1').then((response) => {
      assert(response)
      done()
    })
  })

  it('should NOT unlock existing wallet with incorrect password', (done) => {
    w.unlock('myPassword2').then((response) => {
      assert(!response)
      done()
    })
  })

  it('should NOT unlock existing wallet with incorrect password', (done) => {
    w.unlock('myPassword2').then((response) => {
      assert(!response)
      done()
    })
  })

  it('should unlock wallet', (done) => {
    w.unlock('myPassword1').then((response) => {
      assert(response)
      done()
    })
  })

  it('should lock and unlock a wallet in fs', (done) => {
    let w2
    const w1 = new Wallet('testWallet', { storage: 'fs', silent: true })
    w1.add('credentials', { name: 'admintest', role: 'admin' })
    expect(w1.data.credentials[0]).to.eql({ name: 'admintest', role: 'admin' })
    w1.lock('myPassword')
      .then((response) => {
        assert(response)
        w2 = new Wallet('testWallet', { storage: 'fs', silent: true })
        return w2.unlock('myPassword')
      })
      .then((response) => {
        expect(w2.data.credentials[0]).to.eql({ name: 'admintest', role: 'admin' })
        done()
      })
  })
})
