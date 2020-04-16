const Zenroom = require('@lorena-ssi/zenroom-lib')
const fsPromises = require('fs').promises
const os = require('os')
const home = os.homedir()
const log = require('debug')
const debug = log('did:debug:wallet-fs')
debug.enabled = true

export default class Wallet {
  constructor (username) {
    this.directoryPath = `${home}/.lorena/wallets/${username}`
    this.zenroom = new Zenroom(true)
    this.changed = false
    // info
    this.info = {
      matrixUser: '',
      matrixPass: '',
      keyPair: {},
      person: {}
    }
    // data
    this.data = {
      credentials: [],
      links: [],
      tasks: []
    }
  }

  async read (source) {
    try {
      // debug('Reading', `${this.directoryPath}/${source}`)
      const data = await fsPromises.readFile(`${this.directoryPath}/${source}`, 'utf-8')
      return data
    } catch (error) {
      throw new Error(error)
    }
  }

  async write (source, data) {
    try {
      await fsPromises.mkdir(this.directoryPath, { recursive: true })
      await fsPromises.writeFile(`${this.directoryPath}/${source}`, data)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   *
   * @param {string} password Pass
   */
  async unlock (password) {
    try {
      const info = await this.read('info')
      const infoDecrypted = await this.zenroom.decryptSymmetric(password, JSON.parse(Buffer.from(info, 'base64').toString()))
      this.info = JSON.parse(infoDecrypted.message)
      const data = await this.read('data')
      const dataDecrypted = await this.zenroom.decryptSymmetric(password, JSON.parse(Buffer.from(data, 'base64').toString()))
      this.data = JSON.parse(dataDecrypted.message)
      // debug('Info %O', this.info)
      // debug('Data %O', this.data)
      return true
    } catch (_e) {
      return false
    }
  }

  /**
   * Encrypt and save configuration.
   *
   * @param {string} password Password to encrypt configuration
   */
  async lock (password) {
    const infoEncrypted = await this.zenroom.encryptSymmetric(password, JSON.stringify(this.info), 'Wallet info')
    await this.write('info', Buffer.from(JSON.stringify(infoEncrypted)).toString('base64'))
    const dataEncrypted = await this.zenroom.encryptSymmetric(password, JSON.stringify(this.data), 'Wallet data')
    await this.write('data', Buffer.from(JSON.stringify(dataEncrypted)).toString('base64'))
    this.changed = false
  }

  get (collection, where) {
    let result = false
    this.data[collection].filter((item, index) => {
      Object.entries(where).forEach((searchTerm) => {
        if (item[searchTerm[0]] === searchTerm[1]) {
          result = this.data[collection][index]
        }
      })
    })
    return result
  }

  add (collection, value) {
    this.changed = true
    if (typeof collection !== 'string') throw new Error('Collection should be a String')
    if (typeof value !== 'object') throw new Error('Value should be an Object')
    if (!this.data[collection]) this.data[collection] = []
    this.data[collection].push(value)
  }

  update (collection, where, value) {
    this.changed = true
    if (typeof collection !== 'string') throw new Error('Collection should be a String')
    if (typeof where !== 'object') throw new Error('Value should be an Object')
    if (typeof value !== 'object') throw new Error('Value should be an Object')
    const found = this.data[collection].filter((item, index) => {
      let founded
      Object.entries(where).forEach((searchTerm) => {
        if (item[searchTerm[0]] === searchTerm[1]) {
          this.data[collection][index] = { ...this.data[collection][index], ...value }
          founded = true
        } else {
          founded = false
        }
      })
      return founded
    })
    return found.length > 0
  }

  remove (collection, where) {
    this.changed = true
    if (typeof collection !== 'string') throw new Error('Collection should be a String')
    if (typeof where !== 'object') throw new Error('Value should be an Object')
    const found = this.data[collection].filter((item) => {
      let founded
      Object.entries(where).forEach((searchTerm) => {
        if (item[searchTerm[0]] === searchTerm[1]) {
          founded = true
        } else {
          founded = false
        }
      })
      return !founded
    })
    this.data[collection] = found
    return found
  }
}
