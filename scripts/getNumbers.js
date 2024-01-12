function getNumbers () {
  const phones = [];
  [...document.querySelectorAll('.rllt__details div:nth-child(4)')].forEach(phone => {
      const target = /\d{4,}/.exec(phone.textContent.replaceAll(" ", ""))
      if (target){
          phones.push(target[0])
      }
      
  })
  return phones.join("\n");
}