const { CSVUtil, FileUtil, WhatsappUtil, CLIUtil, ContactsUtil } = require("./utils");


main ();

async function main () {

  try {

    await CLIUtil.displayIntro("SuperWhats");    

    const contacts_path = await CLIUtil.input({ message: "Enter the path of the contacts file:", default: "./data/contacts.csv" });

    const excluded_contacts_path = await CLIUtil.input({ message: "Enter the path of the excluded contacts file:", default: "./data/excluded_contacts.csv" });

    const message_path = await CLIUtil.input({ message: "Enter the path of the contacts file:", default: "./data/message.txt" });  
    
    const accept_duplicate_contacts = await CLIUtil.input({ message: "Do you want to allow duplicate contacts? (y/n)", default: false  });

    const config = {
      contacts_path,
      excluded_contacts_path,
      message_path,
      accept_duplicate_contacts
    }

    const contacts = ContactsUtil.sanitize(await CSVUtil.fetch(config.contacts_path, ['phone']));

    const excluded_contacts = ContactsUtil.sanitize(await CSVUtil.fetch(config.excluded_contacts_path, ['phone']));

    const prepared_contacts = ContactsUtil.execlude(!config.accept_duplicate_contacts ? ContactsUtil.unduplicate(contacts) : contacts, excluded_contacts);

    const contacts_length = prepared_contacts.length;

    const message = await FileUtil.read(config.message_path);

    await WhatsappUtil.init();
  
    let i = 0;

    console.log ("[+] Messaging started\n");

    CLIUtil.startProgress ({ total_progress: contacts_length });

    for (const contact of prepared_contacts) {
  
      const { phone } = contact;
  
      try {
  
        CLIUtil.updateProgress(++i);

        await WhatsappUtil.sendMessage(phone, message);

      } catch(err) {
        
        console.log ("❌ Sending Message Failed")

        console.log (err);

      }
  
    }

    WhatsappUtil.close();

    console.log ("\n", "[+] Messaging ended.")
  
    process.exit(1);

  } catch (err) {

    console.log ("❌ App Stopped Working")

    console.log (err);

    process.exit(0);

  }

}