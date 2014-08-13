/**
 * SendGrid Cloud Module
 * @name SendGrid
 * @namespace
 *
 * Cloud Module for using <a href="https://www.sendgrid.com">SendGrid</a>.
 *
 * <ul><li>Module Version: 2.0.0</li>
 * <li>SendGrid API Version: Not versioned</li></ul>
 *
 * To use this Cloud Module in Cloud Code, start by requiring
 * the <code>sendgrid</code> module and initializing it using your
 * SendGrid apiUser and apiKey.
 *
 * <pre>var SendGrid = require('sendgrid')('myApiUser','myApiKey');</pre>
 *
 * You can then start using the module in your Cloud Code functions.
 */


(function() {

  /*
  SMTPAPI Library for Parse
  */

  function smtpapi(header) {
    header = header || {};
    this.header = {};
    this.header.to = header.to || [];
    this.header.sub = header.sub || {};
    this.header.unique_args = header.unique_args || {};
    this.header.category = header.category || [];
    this.header.section = header.section || {};
    this.header.filters = header.filters || {};
  }

  smtpapi.prototype.addTo = function(to) {
    if (Array.isArray(to)) {
      this.header.to = this.header.to.concat(to);
    } else {
      this.header.to.push(to);
    }
  };

  smtpapi.prototype.setTos = function(to) {
    if (Array.isArray(to)) {
      this.header.to = to;
    } else {
      this.header.to = [to];
    }
  };

  smtpapi.prototype.addSubstitution = function(key, val) {
    if (this.header.sub[key] === undefined) this.header.sub[key] = [];
    if (Array.isArray(val)) {
      this.header.sub = this.header.sub[key].concat(val);
    } else {
      this.header.sub[key].push(val);
    }
  };

  smtpapi.prototype.setSubstitutions = function(subs) {
    this.header.sub = subs;
  };

  smtpapi.prototype.addUniqueArg = function(key, val) {
    this.header.unique_args[key] = val;
  };

  smtpapi.prototype.setUniqueArgs = function(val) {
    this.header.unique_args = val;
  };

  smtpapi.prototype.addCategory = function(cat) {
    if (Array.isArray(cat)) {
      this.header.category.concat(cat);
    } else {
      this.header.category.push(cat);
    }
  };

  smtpapi.prototype.setCategories = function(cats) {
    if (Array.isArray(cats)) {
      this.header.category = cats;
    } else {
      this.header.category = [cats];
    }
  };

  smtpapi.prototype.addSection = function(sec, val) {
    this.header.section[sec] = val;
  };

  smtpapi.prototype.setSections = function(sec) {
    this.header.section = sec;
  };

  smtpapi.prototype.addFilter = function(filter, setting, val) {
    if (this.header.filters[filter] === undefined) {
      this.header.filters[filter] = {'settings': {}};
    }
    this.header.filters[filter].settings[setting] = val;
  };

  smtpapi.prototype.setFilters = function(filters) {
    this.header.filters = filters;
  };

  smtpapi.prototype.jsonString = function() {
    var header = {};
    for (var key in this.header) {
      if (this.header.hasOwnProperty(key) && Object.keys(this.header[key]).length) {
        header[key] = this.header[key];
      }
    }
    return JSON.stringify(header);
  };

  /*
  SendGrid.Email implementation for Parse
  */

  function Email(mail) {
    if (!(this instanceof Email)) {
      return new Email(mail);
    }

    mail = mail || {};
    smtpapi.call(this, mail['x-smtpapi']);
    this.body = {};
    this.toCounter = 0;
    this.bccCounter = 0;
    this.tonameCounter = 0;
    this.addTo(mail.to || mail['to[]']);
    this.addToName(mail.toname || mail['toname[]']);
    this.addBcc(mail.bcc || mail['bcc[]']);
    this.body.from = mail.from || '';
    this.body.fromname = mail.fromname || '';
    this.body.subject = mail.subject || '';
    this.body.text = mail.text || '';
    this.body.html = mail.html || '';
    this.body.replyto = mail.replyto || '';
    this.body.date = mail.date || new Date().toUTCString();
    this.body.headers = mail.headers || '';
  }

  Email.prototype = Object.create(smtpapi.prototype);
  Email.prototype.constructor = Email;

  Email.prototype.addTo = function(email) {
    smtpapi.prototype.addTo.call(this, email);
    if (Array.isArray(email)) {
      for (var i = 0, len = email.length; i < len; i++) {
        this.body['to[' + this.toCounter++ +']'] = email[i];
      }
    } else {
      this.body['to['+ this.toCounter++ +']'] = email;
    }
  };

  Email.prototype.addToName = function(name) {
    if (Array.isArray(name)) {
      for (var i = 0, len = name.length; i < len; i++) {
        this.body['toname[' + this.tonameCounter++ +']'] = name[i];
      }
    } else {
      this.body['toname['+ this.tonameCounter++ +']'] = name;
    }
  };

  Email.prototype.addBcc = function(bcc) {
    if (Array.isArray(bcc)) {
      for (var i = 0, len = bcc.length; i < len; i++) {
        this.body['bcc[' + this.bccCounter++ + ']'] = bcc[i];
      }
    } else {
      this.body['bcc['+ this.bccCounter++ +']'] = bcc;
    }
  };

  Email.prototype.setFrom = function(email) {
    this.body.from = email;
  };

  Email.prototype.setFromName = function(name) {
    this.body.fromname = name;
  };

  Email.prototype.setSubject = function(subject) {
    this.body.subject = subject;
  };

  Email.prototype.setText = function(text) {
    this.body.text = text;
  };

  Email.prototype.setHTML = function(html) {
    this.body.html = html;
  };

  Email.prototype.setReplyTo = function(replyto) {
    this.body.replyto = replyto;
  };

  Email.prototype.setDate = function(date) {
    this.body.date = date;
  };
  //check its constructor for a better management

  Email.prototype.addFileFromBuffer = function (filename, buffer) {
    this.addFileFromStream(filename, buffer.toString());
  };

  Email.prototype.addFileFromStream = function (filename, str) {
    this.body['files[' + filename + ']'] = str;
  };

  Email.prototype.addFile = function (filename, file, cb) {
    var promise = new Parse.Promise();
    var self = this;
    Parse.Cloud.httpRequest({url: file.url(),
      success: function (res) {
        self.addFileFromBuffer(filename, res.buffer);
        if (cb && cb.success) {
          cb.success();
        }
        promise.resolve();
      },
      error: function (res) {
        if (cb && cb.error) {
          cb.error(res);
        }
        promise.reject(res);
      }
    });
    return promise;
  };

  Email.prototype.setHeaders = function(header) {
    this.body.headers = header;
  };

  Email.prototype.setAPIHeader = function(header) {
    this.body['x-smtpapi'] = header || this.jsonString();
  };

  Email.prototype.getEmail = function() {
    this.setAPIHeader();
    var body = {};
    for (var key in this.body) {
      if (this.body.hasOwnProperty(key) && this.body[key]) {
        if (Array.isArray(this.body[key]) && this.body[key].length === 0) {
          continue;
        }
        body[key] = this.body[key];
      }
    }
    return body;
  };

  /**
   * Initialize the SendGrid module with the proper credentials
   * @param {String} apiUser Your SendGrid apiUser
   * @param {String} apiKey Your SendGrid apiKey
  */

  function SendGrid() {
    //Private
    var options = {
      method  : 'POST',
      uri     : 'https://api.sendgrid.com/api/mail.send.json'
    };

    var credentials = {};

    var _buildBody = function(mail) {
      if (mail.constructor.name === 'Email') {
        mail = mail.getEmail();
      } else {
        mail = (new Email(mail)).getEmail();
      }
      mail.api_user = credentials.api_user;
      mail.api_key = credentials.api_key;
      return mail;
    };

    //Priviledged / Protected
    this.send = function (email, cb) {
      var promise = new Parse.Promise();

      Parse.Cloud.httpRequest({
        method: options.method,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				url: options.uri,
        body: _buildBody(email),
        success: function(httpResponse) {
          if (cb && cb.success) {
            cb.success(httpResponse);
          }
          promise.resolve(httpResponse);
        },
        error: function(httpResponse) {
          if (cb && cb.error) {
            cb.error(httpResponse);
          }
          promise.reject(httpResponse);
        }
      });

      return promise;
    };

    this.initialize = function (api_user, api_key) {
      credentials.api_user = api_user;
      credentials.api_key = api_key;
    };

    //Public
    this.Email = Email;
    this.smtpapi = smtpapi;
  }

  SendGrid.prototype.sendEmail = function (email, cb) {
    return this.send(email, cb);
  };

  module.exports = new SendGrid();
}());
