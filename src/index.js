// https://sensorpro.eu/
// https://e.sensorpro.net/
// https://sensorpro.net/api/
export class SensorProError extends Error {
  constructor (Result) {
    super()
    this.name = 'SensorProError'
    this.Result = Result
  }
}

export class SensorPro {
  #token = null
  #expiresWhen = null
  #apiEndpoint = null

  #apiKey
  #organization
  #user
  #password

  constructor ({ apiKey, organization, user, password }) {
    this.#apiKey = apiKey
    this.#organization = organization
    this.#user = user
    this.#password = password
  }

  #isLoggedIn () {
    return this.#token && Date.now() < this.#expiresWhen
  }

  // https://sensorpro.net/api/index.html#auth-signin
  async #login () {
    // Remember to create an API user: API users have perpetual passwords.
    const url = 'https://apinie.sensorpro.net/auth/sys/signin'
    const headers = {
      'Content-Type': 'application/json',
      'x-apikey': this.#apiKey
    }
    const body = {
      Organization: this.#organization,
      User: this.#user,
      Password: this.#password
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      // handle errors https://sensorpro.net/api/#introduction-determining
      throw new Error(`SensorPro login HTTP error: ${response.status}`)
    }

    const responseObject = await response.json()
    if (responseObject.Result.TotalErrors > 0) {
      throw new SensorProError(responseObject.Result)
    }

    this.#token = responseObject.Token
    this.#expiresWhen = Date.now() + responseObject.ExpiresIn * 1000
    this.#apiEndpoint = responseObject.APIEndpoint
  }

  async #attemptLogin () {
    const attempts = 3
    for (let i = 0; i < attempts; i++) {
      try {
        await this.#login()
        return
      } catch (err) {
        console.error(`SensorPro login attempt ${i + 1} failed:`, err)
        if (i === attempts - 1) {
          throw err
        }
      }
    }
  }

  // https://sensorpro.net/api/index.html#auth-logoff
  async #logout () {
    if (this.#isLoggedIn()) {
      const url = `${this.#apiEndpoint}auth/sys/logoff/${this.#token}`
      const headers = { 'Content-Type': 'application/json' }
      await fetch(url, {
        method: 'POST',
        headers
      })
      this.#token = null
      this.#expiresWhen = null
      this.#apiEndpoint = null
    }
  }

  /*
  *
  *
  * Contacts
  *
  *
  */

  // https://sensorpro.net/api/contacts.html#contacts-getcontacts
  async getContacts (body) {
    if (this.#isLoggedIn()) {
      const url = `${this.#apiEndpoint}api/Contact/GetContacts/${this.#token}`
      const headers = { 'Content-Type': 'application/json' }
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      })
      const responseObject = await response.json()
      if (responseObject.Result.TotalErrors > 0) {
      // if error not authorized? TODO login and try again
        throw new SensorProError(responseObject.Result)
      }
      return responseObject
    } else {
      await this.#attemptLogin()
      return this.getContacts(body)
    }
  }

  // https://sensorpro.net/api/contacts.html#contacts-add
  async add (body) {
    if (this.#isLoggedIn()) {
      const url = `${this.#apiEndpoint}api/Contact/Add/${this.#token}`
      const headers = { 'Content-Type': 'application/json' }
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      })
      const responseObject = await response.json()
      if (responseObject.Result.TotalErrors > 0) {
        // if error not authorized? TODO login and try again
        throw new SensorProError(responseObject.Result)
      }
    } else {
      await this.#attemptLogin()
      return this.add(body)
    }
  }

  // https://sensorpro.net/api/contacts.html#contacts-update
  async update (body) {
    if (this.#isLoggedIn()) {
      const url = `${this.#apiEndpoint}api/Contact/Update/${this.#token}`
      const headers = { 'Content-Type': 'application/json' }
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
      })
      const responseObject = await response.json()
      if (responseObject.Result.TotalErrors > 0) {
        // if error not authorized? TODO login and try again
        throw new SensorProError(responseObject.Result)
      }
    } else {
      await this.#attemptLogin()
      return this.update(body)
    }
  }

  // https://sensorpro.net/api/contacts.html#contacts-changeoptoutstatus
  async changeOptOutStatus (body) {
    if (this.#isLoggedIn()) {
      const url = `${this.#apiEndpoint}api/Contact/ChangeOptOutStatus/${this.#token}`
      const headers = { 'Content-Type': 'application/json' }
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
      })
      const responseObject = await response.json()
      if (responseObject.Result.TotalErrors > 0) {
        // if error not authorized? TODO login and try again
        throw new SensorProError(responseObject.Result)
      }
    } else {
      await this.#attemptLogin()
      return this.changeOptOutStatus(body)
    }
  }

  /*
  *
  *
  * Campaigns
  *
  *
  */

  // https://sensorpro.net/api/campaigns.html#campaign-TriggerEmail
  async triggerEmail (body) {
    if (this.#isLoggedIn()) {
      const url = `${this.#apiEndpoint}api/Campaign/TriggerEmail/${this.#token}`
      const headers = { 'Content-Type': 'application/json' }
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      })
      const responseObject = await response.json()
      if (responseObject.Result.TotalErrors > 0) {
        // if error not authorized? TODO login and try again
        throw new SensorProError(responseObject.Result)
      }
    } else {
      await this.#attemptLogin()
      return this.triggerEmail(body)
    }
  }
}
