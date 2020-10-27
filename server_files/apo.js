const http = require('http');
const fs = require('fs')

const inquirer = require('inquirer')

var filename = '';
var questions;
console.log('This program searches and finds files inside the given directory')
console.log('Please, don\'t forget to include the extension')
console.log('')

const program = () => {

    var questions = [
    {
        type: 'input',
        name: 'filename',
        message: "What's the file name?"
    }
    ]

    inquirer.prompt(questions).then(answers => {
        const getFile = (fileName) => {
            return new Promise((resolve, reject) => {
                fs.readFile(fileName, (err, data) => {
                    filename = fileName
                    if (err) {
                        reject (err)  // calling `reject` will cause the promise to fail with or without the error passed as an argument
                        return        // and we don't want to go any further
                    }
                    resolve(data)
                })
            })
        }
        
        getFile(answers['filename'])
        .then(data => console.log(`Found ${filename}`))
        .catch(err => console.log(`No such file as ${filename}`))
        setTimeout(open, 1000)
    })
}

const open = () => {
    questions = [
        {
        type: 'input',
        name: 'question',
        message: "Want to read the file? (Y/N)"
        }
    ]

    inquirer.prompt(questions).then(answers => {
            switch (answers['question']) {
                case 'Y':
                    if (filename.split('.')[1] === 'html') {
                        console.log('I see that this is a HTML file!');
                        console.log('');
                        var questionss = [
                            {
                                type: 'input',
                                name: 'questioneer',
                                message: "Should I open it in client side or just plain text? (client/plain)"
                            }
                        ]
                        const qua = () => {
                            inquirer.prompt(questionss).then(answerss => {
                                switch (answerss['questioneer']) {
                                    case 'client':
                                        const game = () => {
                                            http.createServer(function (req, res) {
                                            fs.readFile(filename, function(err, data) {
                                                res.writeHead(200, {'Content-Type': 'text/html'});
                                                res.write(data);
                                                return res.end();
                                            });
                                            }).listen(8080, '127.0.0.1', () => {
                                                console.log(`Server running at http://127.0.0.1:8080/`);
                                            });
                                        }
                                        game()
                                        break;
                                
                                    case 'plain':
                                        const gbam = () => {
                                            http.createServer(function (req, res) {
                                            fs.readFile(filename, function(err, data) {
                                                res.writeHead(200, {'Content-Type': 'text/html'});
                                                res.write("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>View</title></head><body><h1>Hi there!!!</h1><pre>" + data + "</pre></body></html>");
                                                return res.end();
                                            });
                                            }).listen(8080, '127.0.0.1', () => {
                                                console.log(`Server running at http://127.0.0.1:8080/`);
                                            });
                                        }
                                        gbam()
                                        break;
                                
                                    default:
                                        console.log('Please input Y or N only!!!');
                                        qua();
                                        break;
                                }
                            })
                        }
                        qua()
                    } else {
                        const game = () => {
                            http.createServer(function (req, res) {
                            fs.readFile(filename, function(err, data) {
                                res.writeHead(200, {'Content-Type': 'text/plain'});
                                res.write(data);
                                return res.end();
                            });
                            }).listen(8080, '127.0.0.1', () => {
                                console.log(`Server running at http://127.0.0.1:8080/`);
                            });
                        }
                        game()
                    }
                    break;
            
                case 'N':
                    prompter()
                    break;
            
                default:
                    console.log('Please input Y or N only!!!');
                    open();
                    break;
            }
        })
}

program()

questions = [
    {
    type: 'input',
    name: 'question',
    message: "Want to go again? (Y/N)"
    }
]

const prompter = () => {
    inquirer.prompt(questions).then(answers => {
        switch (answers['question']) {
            case 'Y':
                program();
                break;
        
            case 'N':
                break;
        
            default:
                console.log('Please input Y or N only!!!');
                prompter();
                break;
        }
    })
}