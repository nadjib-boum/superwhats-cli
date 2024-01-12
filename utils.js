const fs = require('fs');
const csv = require('csv-parser');
const Whatsapp = require('whatsapp-web.js');
const spinnerUtil = require("nanospinner");
const figlet = require("figlet");
const gradient = require('gradient-string');
const qrcode = require("qrcode-terminal");
const inquirer_prompts = require("@inquirer/prompts");
const inquirer_confirm = require("@inquirer/confirm");
const cliProgress = require('cli-progress');
const { sanitizePhone, serializePhone, sleep, random, exclude, unduplicate } = require("./helpers")

class CSVUtil {

  fetch(filePath, fields) {
    return new Promise((resolve, reject) => {
      if (!fields || !fields.length) reject(new Error("CSV fields are not provided"))
      if (!filePath) reject(new Error("CSV file is not provided"))
      const data = [];
      fs.createReadStream(filePath)
        .pipe(csv(fields))
        .on('data', (row) => {
          data.push(row);
        })
        .on('end', () => {
          resolve(data.splice(1));
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
}

class WhatsappUtil {

  constructor (config) {
    this.client = new Whatsapp.Client();
    this.config = config || {
      time_range: {
        min: 1,
        max: 15
      }
    };
  }

  init () {
    
    return new Promise ((resolve) => {
      const qr_spinner = spinnerUtil.createSpinner("Authentication QR Code Generation\n").start({ color: "cyan" });
      let ready_spinner;
      this.client.on('qr', qr => {
        qr_spinner.success();
        qrcode.generate(qr, {small: true});
        ready_spinner = spinnerUtil.createSpinner("Authentication processing").start({ color: "cyan" });
      });
      
      this.client.on('ready', () => {
        ready_spinner.success()
        resolve();
      });
  
      this.client.initialize();

    })

  }

  async sendMessage(phone, message, options = {}) {
    try {
      await this.client?.sendMessage(phone, message, options);
      // await this.client?.sendMessage(serializePhone(sanitizePhone(phone)), message, options);
      await sleep(random(this.config.time_range.min, this.config.time_range.max) * 1000);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async close () {
    this.client.destroy();
  }

}

class FileUtil {

  read(filePath) {
    try {

      if (!filePath) throw new Error("No file path is provided");

      const data = fs.readFileSync(filePath, 'utf8');
      
      return data.toString();
      
    } catch (err) {
      return Promise.reject(err);
    }
  }

}

class CLIUtil {

  constructor () {
    this.progress_bar = null;
    this.total_progress = null;
  }

  displayIntro (message) {
    return new Promise((resolve, reject) => {
      figlet(message, function (err, data) {
        if (err) {
          reject(err);
        }
        console.log(gradient.cristal(data));
        console.log ("\n");
        resolve();
      });
    });
  }

  async input (props) {

    const { message, default: defaultAnswer } = props;

    const answer = await inquirer_prompts.input({ message, default: defaultAnswer });

    return answer;

  }

  async confirm (props) {

    const { message, default: defaultAnswer } = props;

    const answer = await inquirer_confirm.confirm({ message, default: defaultAnswer });

    return answer;

  }

  startProgress ({ total_progress }) {

    this.progress_bar = new cliProgress.SingleBar({}, cliProgress.Presets.rect);

    this.total_progress = total_progress;

    this.progress_bar.start(100, 0);

  }

  updateProgress (i) {
    this.progress_bar.update((i / this.total_progress) * 100, { speed: "20" });
  }

}

class ContactsUtil {

  sanitize (contacts) {
    return this.#serialize(this.#unserialize(contacts).map((p) => serializePhone(sanitizePhone(p))))
  }

  #serialize (phones) {
    return phones.map((p) => ({ phone: p }))
  }

  #unserialize (contacts) {
    return contacts.map((c) => c.phone)
  }

  unduplicate (contacts) {
    return this.#serialize(unduplicate(this.#unserialize(contacts)));
  }

  execlude (contacts, execluded) {
    return this.#serialize(exclude(this.#unserialize(contacts), this.#unserialize(execluded)))
  }

}

module.exports = {
  CSVUtil: new CSVUtil(),
  FileUtil: new FileUtil(),
  WhatsappUtil: new WhatsappUtil(),
  CLIUtil: new CLIUtil(),
  ContactsUtil: new ContactsUtil()
}