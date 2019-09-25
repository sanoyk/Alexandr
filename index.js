require('dotenv').config();

const nconf = require('nconf');
const path = require('path');


const db = nconf.argv().env()
    .file({
        file: path.join(__dirname, 'orders.json')
    });


let token = process.env.SLACK_BOT_TOKEN;
const SlackBot = require('super-slack-bot');

const bot = new SlackBot({
    token: token,
    name: process.env.SLACK_BOT_NAME,
});

let interactivePizzaList = {
    "response_type": "in_channel",
    "attachments": [
        {
"text": "Какую пиццу вы желаете?",
    "attachment_type": "default",
    "callback_id": "pizza_name",
    "actions": [
    {
        "name": "pizza_list",
        "text": "Пиццы...",
        "type": "select",
        "options": [
            {
                "text": "Мясная",
                "value": "meat"
            },
            {
                "text": "Сырная",
                "value": "cheese"
            },
            {
                "text": "Пепперони",
                "value": "pepperoni"
            },
            {
                "text": "Четыре сыра",
                "value": "four_cheese"
            },
        ]
    }
]
}
]
};
bot.on('message.channels', (route, routeMention) => {
    route(/Я хочу пиццу|Пицца|Заказ/gi, async function (response, classMessage) {
        await classMessage.reply('Вас приветствует пицца-бот!', interactivePizzaList);
    });
});



bot.on('conversation', async (route, response) => {
    route('pizza_name', async function (responseInitiator, classConversation) {
        let numberOrder = Math.floor(Math.random() * (100000 - 1)) + 1;

        db.set(`${numberOrder}`, {
            'user_id' : responseInitiator.user.id,
            'pizza' : responseInitiator.actions.shift().selected_options.shift().value,
            'delivery date': moment().add(40, 'minute'),
        });
        db.save();
        response.end(`Ваш номер заказа ${numberOrder}. Доставка через 40 минут` );
    });
});
