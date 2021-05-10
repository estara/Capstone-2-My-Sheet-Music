import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

/** API Class.
 *
 * Static class tying together methods used to get/send to to the API.
 *
 */

class MyMusicApi {
  // the token for interacting with the API will be stored here.
  static token;

  static async request(endpoint, data = {}, method = "get") {
    console.debug("API Call:", endpoint, data, method);
    const url = `${BASE_URL}/${endpoint}`;
    const headers = { Authorization: `Bearer ${MyMusicApi.token}` };
    const params = (method === "get")
        ? data
        : {};

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (err) {
      console.error("API Error:", err.response);
      let message = err.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }

  // Individual API routes

  // get details on single user
  static async getUser(id) {
    let res = await this.request(`users/${id}`);
    return res;
  }

  // get details on all users
  static async getUsers() {
    let res = await this.request(`users`);
    return res;
  }

  // update user
  static async updateUser(id, formData) {
    let res = await this.request(`users/${id}`, formData, "PATCH");
    return res;
  }

  // delete user
  static async deleteUser(id) {
    await this.request(`users/${id}`, {}, "DELETE");
  }
  
  // login user
  static async login(formData) {
    let res = await this.request(`auth/token`, formData, "POST");
    this.token = res.token;
    return this.token;
  }

  // logout user
  static logout() {
    this.token = null;
  }

  // signup new user
  static async signup(formData) {
    const res = await this.request(`auth/register`, formData, "POST");
    this.token = res.token;
    return this.token;
  }

  // get music catalog
  static async getLibrary(formData = false) {
    let res
    if (formData) {
      res = await this.request(`library`, formData);
    } else {
    res = await this.request(`library`);}
    return res;
  }

  // get single composition
  static async getWork(id) {
    let res = await this.request(`library/${id}`);
    return res;
  }

  // add a composition
  static async addWork(formData) {
    const res = await this.request(`library`, formData, "POST");
    return res;
  }

  // add work to user library
  static async addItem(username, id) {
    const res = await this.request(`users/${username}/userLib/${id}`, {}, "POST");
    console.log(res)
  }
  
  // get user's library
  static async getUserLib(id) {
    const res = await this.request(`userLib/user/${id}`);
    return res;
  }

  // get info on single entry in user's library
  static async getUserWork(id) {
    const res = await this.request(`userLib/${id}`);
    return res;
  }

  // update info on single entry in user's library
  static async updateUserWork(id, formData) {
    const res = await this.request(`userLib/${id}`, formData, "PATCH");
    return res;
  }

  // delete entry from user's library
  static async deleteUserWork(id) {
    const res = await this.request(`userLib/${id}`, "DELETE");
    return res
  }
}

export default MyMusicApi;