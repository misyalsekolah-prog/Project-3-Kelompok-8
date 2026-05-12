const rl = require('readline-sync')

const Database =
    require('./src/Database')

const Book =
    require('./src/BookModel')

async function main() {

    const db = new Database()
    await db.connect()

    const book = new Book()

    while (true) {

        console.log('\n=== Library ===')
        console.log('1. View The Book')
        console.log('2. Search The Book')
        console.log('3. Borrow The Book')
        console.log('4. Return The Book')
        console.log('5. The Book Category Statistic')
        console.log('6. 20 Book Based on High Rate')
        console.log('7. Exit')

        let pilih = rl.question('Choose The Menu: ')

        switch (pilih) {

            case '1':
                await book.show_books()
                break

            case '2':
                let search = rl.question('Search the title: ')
                await book.search_book(search)
                break

            case '3':
                let name = rl.question('Your Name: ')
                let id = rl.question('Your ID: ')
                let phone = rl.question('Your phone: ')
                console.log('\nChoose day:')
                console.log('1. Monday')
                console.log('2. Tuesday')
                console.log('3. Wednesday')
                console.log('4. Thursday')
                console.log('5. Friday')
                let day_choice = rl.question('Today: ')
                let day
                switch(day_choice){
                    case '1':
                        day = 'Monday'
                        break

                    case '2':
                        day = 'Tuesday'
                        break

                    case '3':
                        day = 'Wednesday'
                        break

                    case '4':
                        day = 'Thursday'
                        break

                    case '5':
                        day = 'Friday'
                        break

                    default:
                        console.log('Invalid day')
                        break
                }
                let date = rl.question('Current Date: ')
                let book_isbn = Number(rl.question('Book ISBN: '))
                await book.borrow_book(name, id, phone, book_isbn, day, date)
                break

            case '4':
                let borrower_id = rl.question('Your ID: ')
                let r_book_isbn = Number(rl.question('Book ISBN: '))
                console.log('\nChoose day:')
                console.log('1. Monday')
                console.log('2. Tuesday')
                console.log('3. Wednesday')
                console.log('4. Thursday')
                console.log('5. Friday')
                let r_day_choice = rl.question('Today: ')
                let r_day
                switch(r_day_choice){
                    case '1':
                        r_day = 'Monday'
                        break

                    case '2':
                        r_day = 'Tuesday'
                        break

                    case '3':
                        r_day = 'Wednesday'
                        break

                    case '4':
                        r_day = 'Thursday'
                        break

                    case '5':
                        r_day = 'Friday'
                        break

                    default:
                        console.log('Invalid day')
                        break
                }
                let r_date = rl.question('Current Date: ')
                await book.return_book(borrower_id, r_book_isbn, r_day, r_date)
                break

            case '5':
                await book.book_category_statistics()
                break

            case '6':
                await book.high_rate_book()
                break

            case '7':
                console.log('Program is Complete')
                process.exit()

            default:
                console.log('Menu not Available')
        }
    }
}
main()