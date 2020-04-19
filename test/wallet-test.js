import Wallet from '..'
import { expect, assert } from 'chai'
import { describe, it } from 'mocha'
import fs from 'fs-extra'

const deleteWallet = async (w, path) => {
  if (w.opts.storage === 'fs') {
    fs.removeSync(path)
  } else {
    assert(w.opts.storage === 'mem')
    w.storage = {}
  }
}

describe('Wallet API', function () {
  // run (almost) all tests for each supported storage type
  ['fs', 'mem'].forEach((storage) => {
    const w = new Wallet('testWallet', { storage, silent: true })

    it('should create Wallet class ' + storage, () => {
      expect(w.info.matrixUser).to.equal('')
    })

    it('should delete the wallet (if any remaining from the last test) ' + storage, async () => {
      await deleteWallet(w, w.directoryPath)
    })

    it('should add to credentials collection ' + storage, () => {
      w.add('credentials', { name: 'admintest', role: 'admin' })
      w.add('credentials', { name: 'test1', role: 'user' })
      w.add('credentials', { name: 'test2', role: 'user' })
      w.add('credentials', { name: 'test3', role: 'user' })
      w.add('credentials', { name: 'test4', role: 'user' })
      w.add('credentials', { name: 'test5', role: 'user' })
      expect(w.data.credentials[0]).to.eql({ name: 'admintest', role: 'admin' })
      expect(w.data.credentials[1]).to.eql({ name: 'test1', role: 'user' })
    })

    it('should get the credential ' + storage, () => {
      const cred = w.get('credentials', { name: 'admintest' })
      expect(cred).to.eql({ name: 'admintest', role: 'admin' })
    })

    it('should update the credential ' + storage, () => {
      w.update('credentials', { name: 'admintest' }, { name: 'admintest', role: 'superadmin' })
      expect(w.data.credentials[0]).to.eql({ name: 'admintest', role: 'superadmin' })
    })

    it('should save the wallet (lock) ' + storage, async () => {
      await w.lock('myPassword0')
      expect(w.data.credentials[0]).to.eql({ name: 'admintest', role: 'superadmin' })
    })

    it('should load the wallet (unlock) (fs only)', async () => {
      if (storage === 'fs') {
        const w2 = new Wallet('testWallet', { storage, silent: true })
        await w2.unlock('myPassword0')
        expect(w2.data.credentials[0]).to.eql({ name: 'admintest', role: 'superadmin' })
      }
    })

    it('should remove the credential ' + storage, () => {
      const name = 'test3'
      w.remove('credentials', { name })
      expect(w.data.credentials[3]).to.eql({ name: 'test4', role: 'user' })
    })

    it('should remove all coincidences ' + storage, () => {
      const role = 'user'
      w.remove('credentials', { role })
      expect(w.data.credentials.length).to.equal(1)
    })

    it('should remove all coincidences ' + storage, async () => {
      await w.lock('password0')
    })

    it('should NOT unlock wallet (because it does not exist) ' + storage, (done) => {
      deleteWallet(w, w.directoryPath).then(() => {
        w.unlock('myPassword0').then((response) => {
          assert(!response)
          done()
        })
      })
    })

    it('should lock new wallet (thus creating it) ' + storage, (done) => {
      deleteWallet(w, w.directoryPath).then(() => {
        w.lock('myPassword1').then((response) => {
          assert(response)
          done()
        })
      })
    })

    it('should lock existing wallet with correct password ' + storage, (done) => {
      w.lock('myPassword1').then((response) => {
        assert(response)
        done()
      })
    })

    it('should NOT unlock existing wallet with incorrect password ' + storage, (done) => {
      w.unlock('myPassword2').then((response) => {
        assert(!response)
        done()
      })
    })

    it('should NOT unlock existing wallet with incorrect password ' + storage, (done) => {
      w.unlock('myPassword2').then((response) => {
        assert(!response)
        done()
      })
    })

    it('should unlock wallet ' + storage, (done) => {
      w.unlock('myPassword1').then((response) => {
        assert(response)
        done()
      })
    })
  })

  // Scenarios specific to filesystem
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
