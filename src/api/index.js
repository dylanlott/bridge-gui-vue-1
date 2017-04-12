/* global Storj */
/* eslint no-undef: ["error", { "typeof": false }] */

import axios from 'axios';
import config from '../../config';
import { fromLocalStorage } from '@/utils';
import uuid from 'uuid/v4';
import querystring from 'querystring';

/**
 * Authenticates requests sent to Billing. Only keypair authentication
 * is currently allowed
 * @params {Object} options - Options parameter passed to request
 * @params {String} options.method - HTTP method ('GET', 'POST', 'PUT')
 * @params {String} options.path - Path for HTTP request
 * @params {Object} options.params - for 'GET' requests
 * @params {Object} options.json - for 'POST' and 'PUT' requests
 *
 * Example usage:
 *  billingClient.request({
 *    method: 'GET',
 *    path: '/credits/dateRange',
 *    params: { startDate: '', endDate: '' }
 *  })
 *
 *  billingClient.request({
 *    method: 'POST',
 *    path: '/credits/create',
 *    json: { user: '', type: '' }
 *  })
 *
 */
class BillingClient {
  constructor () {
  }

  request(options) {
    const implementedMethods = ['GET', 'PUT', 'POST'];

    return new Promise((resolve, reject) => {
      const privateKey = fromLocalStorage('privateKey');
      const publicKey = fromLocalStorage('publicKey');

      if (!privateKey) {
        return reject(new errors.BadRequestError('Private key required'));
      }

      if (!publicKey) {
        return reject(new errors.BadRequestError('Public key required'));
      }

      if (implementedMethods.indexOf(options.method) === -1) {
        return reject(new errors.NotImplementedError('Method not implemented'));
      }

      const nonce = uuid();

      // Add nonce to either params or json
      if (['GET'].indexOf(options.method) !== -1) {
        options.params.__nonce = nonce;
      } else {
        options.json.__nonce = nonce;
      }

      // Stringify according to type of request
      const payload = ['GET'].indexOf(options.method) !== -1
        ? querystring.stringify(options.params)
        : JSON.stringify(options.json);

      // Create contract string in format of <METHOD>\<PATH>\n<PARAMS>
      const contract = [options.method, options.path, payload].join('\n');

      //

      const billingRequest = axios.create({
        baseURL: config.app.BILLING_URL,
        headers: {
          'x-pubkey': fromLocalStorage('publicKey')
        }
      })

      const storj = new Storj({
        bridge: config.app.BRIDGE_URL,
        key: privateKey
      });
    });
  }
}