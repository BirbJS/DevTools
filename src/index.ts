/*
 * Copyright (c) 2021, knokbak and contributors.
 *
 * The Birb.JS Project: https://birb.js.org
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Logger from './util/Logger';

class DevTools {

    logger: Logger = null!;
    token: string | null = null;

    constructor (token?: string) {
        this.token = token ?? null;
        this.logger = new Logger(this);
    }

    setToken (token: string) {
        this.token = token;
    }

}

module.exports = DevTools;
export default DevTools;
