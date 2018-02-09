const TelegramBot = require("node-telegram-bot-api");
const mysql = require('mysql');
const TOKEN = "404568801:AAGbYs522aLjZ1IqH7nIFCa-gbCLaJSQUnI";

var con = mysql.createConnection({
    host: "sql2.freemysqlhosting.net",
    user: "sql2220158",
    password: "uR3%zW5*",
    database: "sql2220158"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to mySQL server!");

});


console.log("Bot has been started ...");

const bot = new TelegramBot(TOKEN, {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
});


bot.onText(/\/gusi/, query => {

    con.query(`
    select 
   *
   from 
       userInGroup as uig
       left join 
           user as u on uig.userID = u.id
       left join 
           groups as g on uig.groupID = g.id
    where u.telegramId = ${query.from.id} and g.telegramId = ${query.chat.id}
    
    `, function(err, get_person_id) {
        if (err) { console.log(err) }
        if (!get_person_id[0]) {

            bot.sendMessage(query.chat.id, 'Для начала Вам нужно зарегистрироваться!\nДля этого введите команду /reg');

        } else {


            con.query(`
   select 
   *
   from 
       userInGroup as uig
       left join 
           gusi as g on uig.id = g.id
       left join
           groups as gr on uig.groupID = gr.id
       left join
           user as u on uig.userID = u.id
   where gr.telegramId = ${query.chat.id} and g.date = current_date()
   
   
   `, function(err, get_date) {


                if (get_date[0] != null) {
                    bot.sendMessage(query.chat.id, `Извините, но сегодня уже Гуся выбирали, это - ${get_date[0].name}`);
                } else {

                    let gusiArray = [];
                    con.query(`  
select
    u.name 
from 
    userInGroup as uig
    left join 
        groups as g on uig.groupID = g.id
    left join 
        user as u on uig.userID = u.id
where g.telegramId = ${query.chat.id}
    
    `, function(err, result) {
                        for (item of result) {
                            gusiArray.push(item.name);
                        }
                        let rand = Math.floor(Math.random() * gusiArray.length);
                        let currentGoose = gusiArray[rand];
                        con.query(`
        SET @id = ( select 
            g.id
        from 
            userInGroup as uig
            left join
                user as u on uig.userID = u.id
            left join 
                gusi as g on uig.id = g.id
            left join
                groups as gr on uig.groupID = gr.id
        where u.name = '${currentGoose}' and gr.telegramID = ${query.chat.id}  and u.telegramID = ${query.from.id});
           
        
        `, function(err, res) {
                            con.query(`
            update gusi
            set countGoose = countGoose+1, date = current_date()
            where id = @id
            `, function(err, resul) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    bot.sendMessage(query.chat.id, `Итак, сегодняшний гусь - ${currentGoose}`)
                                }
                            })

                        })


                    });

                }
            });
        }
    });
});
bot.onText(/\/reg/, query => {
    if (query.chat.type == "private") {
        bot.sendMessage(
            query.chat.id,
            "Меня можно использовать только в группах.\nДля этого создайте группу и добавьте меня в нее."
        );
        return;
    }

    const wasCreated = `Вы уже были зарегистрированы в этой игре.`;
    const willBeCreate = `Я тебя запомнил, Гусяра - ${query.from.first_name}`;

    con.query(`select * from groups where telegramId = ${query.chat.id} `, function(err, result) {
        if (result[0]) {
            console.log(result[0]);
        } else {
            con.query(`insert into groups (telegramId, groupname) values('${query.chat.id}','${query.chat.title}')`, function(err, result) {
                if (err) {
                    console.log(result);
                }
            })
        }
    })
    con.query(`select * from user where telegramId = ${query.from.id}`, function(err, result) {
        if (result[0]) {
            console.log(result[0]);
        } else {
            con.query(`insert into user (telegramId, name) values('${query.from.id}','${query.from.first_name}')`, function(err, result) {
                if (err) {
                    console.log(result);
                }
            })
        }
    })
    con.query(` 
select
	*
from 
	userInGroup as uig 
		left join 
			user as u on uig.userID = u.id
		left join 
			groups as gr on uig.groupID = gr.id
where u.telegramId = ${query.from.id} and gr.telegramId = ${query.chat.id};
    
    `, function(err, res) {
        const sql = `
        insert into userInGroup(userID, groupID) values ((select id from user where telegramId = ${query.from.id}), 
        (select id from groups where telegramId = ${query.chat.id}))
        `;
        if (!res[0]) {
            con.query(sql, function(err, result) {
                if (err) {
                    console.log(err);
                }
            });
            con.query(`insert into gusi(telegramId, countGoose) values ('${query.from.id}','0')`, function(err, result) {
                if (err) {
                    console.log(err);
                }
            });
            bot.sendMessage(query.chat.id, willBeCreate)
        } else {
            bot.sendMessage(query.chat.id, wasCreated);
        }

    });
});


bot.onText(/\/me/, query => {
    if (query.chat.type == "private") {
        bot.sendMessage(
            query.chat.id,
            "Меня можно использовать только в группах.\nДля этого создайте группу и добавьте меня в нее."
        );
        return;
    }

    con.query(`
    select
        u.name,
        g.countGoose 
    from 
	    userInGroup as uig 
		inner join
			gusi as g on uig.id = g.id
		inner join 
			user as u on uig.userID = u.id
		inner join 
			groups as gr on uig.groupID = gr.id
    where u.telegramId = ${query.from.id} and gr.telegramId = ${query.chat.id}
    
    `, function(err, result) {
        if (result[0]) {
            bot.sendMessage(query.chat.id, `Вы были ${result[0].countGoose} раз гусем.`);
        } else {
            bot.sendMessage(query.chat.id, 'Вы еще не зарегистрированы.\nВведите команду /reg для регистрации.');
        }
    });


});

formatDate = function(date) {

        var dd = date.getDate();
        if (dd < 10) dd = '0' + dd;

        var mm = date.getMonth() + 1;
        if (mm < 10) mm = '0' + mm;

        var yy = date.getFullYear();
        if (yy < 10) yy = '0' + yy;

        return yy + '-' + mm + '-' + dd;
    },



    bot.onText(/\/start/, query => {
        if (query.chat.type == "private") {
            bot.sendMessage(
                query.chat.id,
                "Меня можно использовать только в группах.\nДля этого создайте группу и добавьте меня в нее."
            );
            return;
        }

        con.query(`SELECT * FROM groups WHERE telegramId = '${query.chat.id}'`, function(err, result) {
            if (err) {
                console.log(err);
            }
            if (result[0]) {
                bot.sendMessage(query.chat.id, `Группа ${query.chat.title} была уже зарегистрирована`)
            } else {
                con.query(`INSERT INTO groups (telegramID, groupname) VALUES ('${query.chat.id}','${query.chat.title}')`, function(err, res) {
                    if (err) {
                        console.log(err);
                    }
                    bot.sendMessage(query.chat.id, `Группа зарегистрирована`);
                })
            }
        })


    });


bot.onText(/\/stat/, query => {
    if (query.chat.type == "private") {
        bot.sendMessage(
            query.chat.id,
            "Меня можно использовать только в группах.\nДля этого создайте группу и добавьте меня в нее."
        );
        return;
    }

    const Person = mongoose.model("person");
    Person.find({
            Group_id: {
                $in: [query.chat.id]
            }
        })
        .sort({
            Counter_Goose: "desc"
        })
        .sort({
            Name: "asc"
        })
        .then(users => {
            if (!users[0]) {
                bot.sendMessage(
                    query.chat.id,
                    "Нету еще зарегистрированных пользователей"
                );
            } else {
                let text_stat = "";
                for (let i = 0; i < users.length; i++) {
                    text_stat += `${users[i].Name?users[i].Name:''} ${users[i].Surname?users[i].Surname:''} - ${users[i].Counter_Goose}\n`;
                }
                bot.sendMessage(
                    query.chat.id,
                    `Вот статистика по всем пользователям:\n${text_stat}`
                );
            }
        })
        .catch(ex => {
            bot.sendMessage(
                query.chat.id,
                "Нету еще зарегистрированных пользователей"
            );
        });
});

bot.onText(/\/help/, query => {
    if (query.chat.type == "private") {
        bot.sendMessage(
            query.chat.id,
            "Меня можно использовать только в группах.\nДля этого создайте группу и добавьте меня в нее."
        );
        return;
    }
    bot.sendMessage(
        query.chat.id,
        `
    Вы можете воспользоваться такими командами:\n/me - Ваша статистика\n/reg - Зарегистрироваться в игре\n/top5 - Выводит Топ 5 Гусей\n/stat - Статистика по всем пользователям\n/help - Помощь по командам\n/gusi - Определить гуся

    `
    );
});

bot.onText(/\/top5/, query => {
    if (query.chat.type == "private") {
        bot.sendMessage(
            query.chat.id,
            "Меня можно использовать только в группах.\nДля этого создайте группу и добавьте меня в нее."
        );
        return;
    }

    const Person = mongoose.model("person");
    Person.find({
            Group_id: {
                $in: [query.chat.id]
            }
        })
        .sort({
            Counter_Goose: "desc"
        })
        .sort({
            Name: "asc"
        })
        .limit(5)
        .then(users => {
            let text_stat = "";
            for (let i = 0; i < users.length; i++) {
                text_stat += `${users[i].Name?users[i].Name:''} ${users[i].Surname?users[i].Surname:''} - ${users[i].Counter_Goose}\n`;
            }
            if (users.length < 5) {
                bot.sendMessage(
                    query.chat.id,
                    `Сейчас количество участников ${
            users.length
          }. Вот их результаты:\n${text_stat}`
                );
            } else {
                bot.sendMessage(query.chat.id, `Топ 5 Гусей:\n${text_stat}`);
            }
        });
});

//-302362122


// me - Ваша статистика
// reg - Зарегистрироваться в игре
// stat - Статистика по всем пользователям
// help - Помощь по командам
// gusi - Определить гуся
// top5 - Вывести Топ 5 гусей