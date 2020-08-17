const { UsaStates } = require('usa-states')

const getHomeRenderObject = () => {
    const createArray = (startingNumber, length) => {
        return [...Array(length).keys()].map(num => ({age: num + startingNumber}))
    }
    const incomeStartDate = [{timeString: 'Immediately', timeInt: 0},
        {timeString: '1 year', timeInt: 1}]
    const incomeStartDateAppendArray = (startingNumber, length) => {
        return [...Array(length).keys()].map(num => ({timeString: `${num + startingNumber} years`,timeInt: num + startingNumber }))
    }
    const fundingSources = ['Savings',
        'QLAC IRA',
        'Traditional IRA',
        'Roth IRA',
        'Pension, 401k, TSP',
        '1035 Exchange',
        '403b Plan',
        '457 Plan',
        'Lawsuit',
        'Other']
    const livingAdjustments = [
        'None',
        '1%',
        '2%',
        '3%',
        '4%',
        '5%',
        'CPI'
    ]
    const concatIncomeArray = incomeStartDate.concat(incomeStartDateAppendArray(2, 19))
    const { states } = new UsaStates()
    return {ages: createArray(50,40),
        incomeStarts: concatIncomeArray,
        states: states.map(stateObj => ({abbr: stateObj.abbreviation})),
        fundingSources,
        livingAdjustments
    }
}

const description = {
    life: 'A life annuity will be paid to you every month until your death. After your death no additional payments will be made.',
    lifeWithMin: `This will be paid to you every month until your death or until <%= term %> years (whichever is longer), 
        however if you die before <%= term %> years after your annuity start date the payments will be made out 
        to your beneficiaries up until <%= term %> years.`,
    lifeWithCashRefund: `Similar to a life annuity, however, if the annuitant does not receive payments at least equal to the amount he/she paid as contributions, then some beneficiary receives the difference in a lump sum`,
    periodCertain: `This annuity will guarantee a payment to you, or a beneficiary after your death, every month for <%= term %> years. After <% term %> years have passed, no payments will be made out regardless of your health.`
}
const variations = [
    {G: 0, Refund: 0, Certain: 0, name: 'Life',
        description: description.life},
    {G: 10, Refund: 0, Certain: 0, name: 'Life With 10 Year',
        description: description.lifeWithMin},
    {G: 15, Refund: 0, Certain: 0, name: 'Life With 15 Year', description: description.lifeWithMin},
    {G: 20, Refund: 0, Certain: 0, name: 'Life With 20 Year', description: description.lifeWithMin},
    {G: 0, Refund: 1, Certain: 0, name: 'Life With Cash Refund', description: description.lifeWithCashRefund},
    {G: 10, Refund: 0, Certain: 1, name: '10 Year Period Certain', description: description.periodCertain},
    {G: 15, Refund: 0, Certain: 1, name: '15 Year Period Certain', description: description.periodCertain},
    {G: 20, Refund: 0, Certain: 1, name: '20 Year Period Certain', description: description.periodCertain}
]

const article1 = `Every investment is a bit like a gamble. Now, most investments are less of a gamble than say a roll at the
craps table. However, there is always some level of risk. Annuities are popular because they provide security
and they are much less risky than all the alternative investment vehicles. With annuities, much like poker, if your smart
and 'you play your cards right' you can greatly increase your chances of ending up on the winning side of the bet.
For better or for worse, the insurance companies that are providing your annuity do not have the resources to individually evaluate your life expectancy,
Instead they will use a general mortality table based only on your age, gender, and current age. If you healthy is especially good
a life annuity will probably be a great investment that provides a tremendous safety net.`

module.exports = {
    getHomeRenderObject,
    variations
}