const fs = require('fs');

var chapters = fs.readFileSync('./chapters.txt', 'utf8');

chapters = chapters.match(/[^\r\n]+/g);

var content = '';
chapters.forEach(val => {
    let path = `./files/${val}.txt`;

    if (fs.existsSync(path)) {
        let fileContent = fs.readFileSync(path, 'utf8');
        fileContent = fileContent.replace(/^第.*?章/g, '').replace(/^\s*$/gm, '');
        content += val + "\r\n\r\n" + fileContent + "\r\n\r\n\r\n";

        console.log(val);
    }
});

fs.writeFileSync(`./merged.txt`, content);
