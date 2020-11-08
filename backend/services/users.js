// Service module to retrieve data from Scheme Users 
const format = require('pg-format')
const {pool} = require('../database/index.js')

const user_type = { customer    : { table : 'customers',    cols : ['email','card']},  
                    deliveryman : { table : 'deliverymans', cols : ['email', 'visibility', 'availiability', 'iban']}, 
                    restaurant  : { table : 'restaurants',  cols : ['email', 'visibility', 'availiability', 'iban']}
                }
/**
     * Customer      -- email || card var(23) 
     * Delivery      -- email || visibility (inactive, invisible, visible) || availiability (rojo, verde)                   || iban
     * Restaurant    -- email || visibility (inactive, invisible, visible) || availiability (rojo, verde, amarillo, naranja)|| iban 
*/

/**
 * Function that retrieves all users from db 
 * @returns an array containg all the users inserted into DB
 */
async function getUsers() {
     //'SELECT * FROM users ORDER BY id ASC' ordering removed
     return pool.query('SELECT * FROM users')
        .then(res =>{
            return res.rows.map(user => user.email)
        })
        .catch(err => err) 
}

/**
 * Function that retrieves information about a user via its email 
 * @returns an array containing the user found. If no user found then it returns null
 */
function getUserByEmail(email) {
    return pool.query('SELECT * FROM users WHERE email = $1',[email])
        .then(res =>{
            return res.rows[0] || null
        })
        .catch(err => err) 
}

/**
 * Method that deletes an user from the DB
 * @param {*} user email used as a primary key
 * @returns
 */
async function deleteUserByEmail(email){
        const user = await getUserByEmail(email)
        //console.log(user)
        if (!user)
                return {error: `User ${email} does not exist`, errCode: 404}

        const user_type = user.tipo

        let table;

        switch(user_type) {
                case 'restaurant':
                        table = 'restaurants'
                        break;
                case 'customer':
                        table = 'customers'
                        break;
                case 'deliveryman':
                        table = 'deliverymans'
                        break;
        }

        const qwe = await _deleteUserByEmailFromTable('users', email)
        if(qwe.error){
                return {error: qwe.error, errCode: 400}
        }

        const status = await _deleteUserByEmailFromTable(table, email)
        //console.log(status)
        if (status.error){
                return {error: status.error, errCode: 400}
        }
        
        return status
}

async function updateUser(body)
{
        const {email} = body
        const user = await getUserByEmail(email)
        if(!user)
                return {error: `User ${email} does not exist`, errCode: 404}
        // user does exist
        const table = _getTableFromUserType(user.tipo)

        const status = await _updateUserByEmailFromTable(table, body)

        return status
}

function _getTableFromUserType(user_type)
{
        let table;

        switch(user_type)
        {
                case 'restaurant':
                        table = 'restaurants'
                        break;
                case 'customer':
                        table = 'customers'
                        break;
                case 'deliveryman':
                        table = 'deliverymans'
                        break;
                default:
                        table = 'unknown'
        }

        return table
}

/**
 * Method that creates and inserts a user into DB
 * @param {*} values contains all the values needed to create a user 
 * @returns 
 */
async function createUser(values){

    let db_values = [values.email, values.name, values.CIF || '', values.street || '', values.password, values.phone || '', values.type]
    const query = format('INSERT INTO users VALUES (%L) RETURNING *', db_values)

    //Check every key to be present
    if (!values.name || !values.email || !values.password   || !values.type || !Object.keys(user_type).includes(values.type)) 
        return {error : "All fields must be filled in order to create the user", errCode : 400}
    
    return pool.query(query)
    .then( async(res)  => {
        let resSpecificrows = await _createSpecficicUser(values)
        if (resSpecificrows.error) return {error: `${resSpecificrows.error}`, errCode : resSpecificrows.errCode}
        res.rows[0].specfics = resSpecificrows
        return res.rows[0] || null
    })
    .catch(err =>  { return {error: `${err}`, errCode : 400}}) 
}

function _extractUserBody(body)
{
        let user = {}

        if(body.email)
                user.email = body.email
        if(body.name)
                user.name = body.name
        if(body.CIF)
                user.CIF = body.CIF
        if(body.street)
                user.street = body.street
        if(body.pass)
                user.pass = body.pass
        if(body.phone)
                user.phone = body.phone
        if(body.tipo)
                user.tipo = body.tipo

        return user
}

function _extractRestaurantBody(body)
{
        let restaurant = {}

        if(body.email)
                restaurant.email = body.email
        if(body.avaliability)
                restaurant.avaliability = body.avaliability
        if(body.visible)
                restaurant.visible = body.visible
        if(body.iban)
                restaurant.iban = body.iban
        if(body.allergens)
                restaurant.allergens = body.allergens

        return restaurant
}

function _extractDeliverymansBody(b)
{
        let d = {}

        if(b.email)
                d.email = b.email
        if(b.avaliability)
                d.avaliability = b.avaliability
        if(b.visible)
                d.visible = b.visible
        if(b.iban)
                d.iban = b.iban

        return d
}

function _extractCustomersBody(b)
{
        let c = {}

        if(b.email)
                c.email = b.email
        if(b.card)
                c.email = b.email

        return c
}

/**
 * Support method that creates the specific user type for each user. These types are : customer, deliveryman and restaurant.
 * This association is made via @argument tipo inside @var values
 * @param {*} values 
 * 
 * 
 */
function _createSpecficicUser(values){
    var arrayValues = []
    for (let i of user_type[values.type].cols){
        arrayValues.push(values[i] || '')
    }
    var sql = format('INSERT INTO %I VALUES (%L) RETURNING *', user_type[values.type].table, arrayValues)
    return pool.query(sql)
    .then(res =>{
        return res.rows[0] || null
    })
    .catch(err =>  { return {error: `${err} specific`, errCode : 400}}) 
    
}

/**
 * Support method for deleting a row from a table that has an email as key
 * @Param {*} table, email
 * @returns
 */
function _deleteUserByEmailFromTable(table, email){
        console.log(table, email)
        return pool.query(`DELETE FROM ${table} WHERE email = '${email}' RETURNING *`)
                .then(res => {
                        console.log(res)
                        return res.rows[0] || null
                })
                .catch(err => {
                        console.log(err)
                        return {error: `${err}`, errCode: 400}
                })
}

function _updateUserByEmailFromTable(table, body)
{
        let query = 'UPDATE'.concat(' ', table, ' SET ')
        //pool.query(query)
}

/**
 * Support method for user data retrieve from the database. A user is identified by email
 * @Param {*} email
 * @returns
 */
function _getSpecificUser(body){
        // should check for sql injection in email
        const sql = `SELECT * FROM users WHERE email = \'${body.email}\'`

        // launch the query and declare callbacks for when the promise is fullfiled
        return pool.query(sql)
                .then(res => {
                        // return the first row (it should be the ONLY row)
                        return res.rows[0]
                })
                .catch(err => {
                        // return not found
                        return {error: `${err} specific`, errCode: 404}
                })
}

module.exports = {getUsers, getUserByEmail, createUser, deleteUserByEmail}
