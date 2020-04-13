const Wallet = require('../src/index').default
const chai = require('chai')
const mocha = require('mocha')
const describe = mocha.describe
const it = mocha.it
// Configure chai
const expect = chai.expect

describe('Wallet API', function () {
  const w = new Wallet('wallet')
  it('should create Wallet class', () => {
    expect(w.info.matrixUser).to.equal('')
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

  xit('should unlock wallet', () => {
    // ...
  })

  xit('should lock wallet', () => {
    // ...
  })

  xit('should write to wallet', () => {
    // ...
  })

  xit('should read from wallet', () => {
    // ...
  })
})
