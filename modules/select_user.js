module.exports = (user_id, telegram_id) =>{
    return ` 
    select
        *
    from 
        userInGroup as uig 
            left join 
                user as u on uig.userID = u.id
            left join 
                groups as gr on uig.groupID = gr.id
    where u.telegramId = ${user_id} and gr.telegramId = ${telegram_id};
        
        `;
}