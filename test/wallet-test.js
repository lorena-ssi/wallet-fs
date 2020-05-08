import Wallet from '..'
import { expect, assert } from 'chai'
import { describe, it } from 'mocha'

describe('Wallet API', function () {
  // run (almost) all tests for each supported storage type
  ['fs', 'mem'].forEach((storage) => {
    const w = new Wallet('testWallet', { storage, silent: true })

    it('should create Wallet class ' + storage, () => {
      expect(w.info.matrixUser).to.equal('')
    })

    it('should delete the wallet (if any remaining from the last test) ' + storage, async () => {
      await w.delete()
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

    it('should lock ' + storage, async () => {
      await w.lock('myPassword0')
    })

    it('should not lock with the wrong password ' + storage, async () => {
      let result = await w.unlock('myPassword0')
      expect(result).to.be.true
      w.add('credentials', { name: 'test6', role: 'user' })
      result = await w.lock('NotMyPasswordX')
      expect(result).to.be.false
    })

    it('should NOT unlock wallet (because it does not exist) ' + storage, (done) => {
      w.delete().then(() => {
        w.unlock('myPassword0').then((response) => {
          assert(!response)
          done()
        })
      })
    })

    it('should lock new wallet (thus creating it) ' + storage, (done) => {
      w.lock('myPassword1').then((response) => {
        assert(response)
        done()
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

    it('should delete wallet ' + storage, (done) => {
      w.delete().then((response) => {
        assert(response)
        done()
      })
    })

    it('should return wallet in JSON  ' + storage, (done) => {
      const w1 = new Wallet('exportWallet', { storage: storage, silent: true })
      w1.add('credentials', { name: 'admintest', role: 'admin' })
      expect(w1.data.credentials[0]).to.eql({ name: 'admintest', role: 'admin' })
      w1.lock('myPassword').then(() => {
        w1.toJSON().then((json) => {
          assert(typeof json.exportWallet.info === 'string', 'Should export info')
          assert(typeof json.exportWallet.data === 'string', 'Should export data')
          w1.delete()
          done()
        })
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
        return w2.delete()
      })
      .then(() => {
        done()
      })
  })
})
