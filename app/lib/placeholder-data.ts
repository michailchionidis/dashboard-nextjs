// This file contains placeholder data that you'll be replacing with real data in the Data Fetching chapter:
// https://nextjs.org/learn/dashboard-app/fetching-data
const users = [
  {
    id: '410544b2-4001-4271-9855-fec4b6a6442a',
    name: 'User',
    email: 'user@nextmail.com',
    password: '123456',
  },
];

const customers = [
  {
    id: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa',
    name: 'Evil Rabbit',
    email: 'evil@rabbit.com',
    image_url: '/customers/evil-rabbit.png',
  },
  {
    id: '3958dc9e-712f-4377-85e9-fec4b6a6442a',
    name: 'Delba de Oliveira',
    email: 'delba@oliveira.com',
    image_url: '/customers/delba-de-oliveira.png',
  },
  {
    id: '3958dc9e-742f-4377-85e9-fec4b6a6442a',
    name: 'Lee Robinson',
    email: 'lee@robinson.com',
    image_url: '/customers/lee-robinson.png',
  },
  {
    id: '76d65c26-f784-44a2-ac19-586678f7c2f2',
    name: 'Michael Novotny',
    email: 'michael@novotny.com',
    image_url: '/customers/michael-novotny.png',
  },
  {
    id: 'CC27C14A-0ACF-4F4A-A6C9-D45682C144B9',
    name: 'Amy Burns',
    email: 'amy@burns.com',
    image_url: '/customers/amy-burns.png',
  },
  {
    id: '13D07535-C59E-4157-A011-F8D2EF4E0CBB',
    name: 'Balazs Orban',
    email: 'balazs@orban.com',
    image_url: '/customers/balazs-orban.png',
  },
];

const invoices = [
  {
    id: '3958dc9e-712f-4377-85e9-fec4b6a6442a',
    customer_id: customers[0].id,
    amount: 15795,
    status: 'pending',
    date: '2022-12-06',
  },
  {
    id: '3958dc9e-742f-4377-85e9-fec4b6a6442a',
    customer_id: customers[1].id,
    amount: 20348,
    status: 'pending',
    date: '2022-11-14',
  },
  {
    id: '3958dc9e-752f-4377-85e9-fec4b6a6442a',
    customer_id: customers[4].id,
    amount: 3040,
    status: 'paid',
    date: '2022-10-29',
  },
  {
    id: '3958dc9e-762f-4377-85e9-fec4b6a6442a',
    customer_id: customers[3].id,
    amount: 44800,
    status: 'paid',
    date: '2023-09-10',
  },
  {
    id: '3958dc9e-772f-4377-85e9-fec4b6a6442a',
    customer_id: customers[5].id,
    amount: 34577,
    status: 'pending',
    date: '2023-08-05',
  },
  {
    id: '3958dc9e-782f-4377-85e9-fec4b6a6442a',
    customer_id: customers[2].id,
    amount: 54246,
    status: 'pending',
    date: '2023-07-16',
  },
  {
    id: '3958dc9e-792f-4377-85e9-fec4b6a6442a',
    customer_id: customers[0].id,
    amount: 666,
    status: 'pending',
    date: '2023-06-27',
  },
  {
    id: '3958dc9e-7a2f-4377-85e9-fec4b6a6442a',
    customer_id: customers[3].id,
    amount: 32545,
    status: 'paid',
    date: '2023-06-09',
  },
  {
    id: '3958dc9e-7b2f-4377-85e9-fec4b6a6442a',
    customer_id: customers[4].id,
    amount: 1250,
    status: 'paid',
    date: '2023-06-17',
  },
  {
    id: '3958dc9e-7c2f-4377-85e9-fec4b6a6442a',
    customer_id: customers[5].id,
    amount: 8546,
    status: 'paid',
    date: '2023-06-07',
  },
  {
    id: '3958dc9e-7d2f-4377-85e9-fec4b6a6442a',
    customer_id: customers[1].id,
    amount: 500,
    status: 'paid',
    date: '2023-08-19',
  },
  {
    id: '3958dc9e-7e2f-4377-85e9-fec4b6a6442a',
    customer_id: customers[5].id,
    amount: 8945,
    status: 'paid',
    date: '2023-06-03',
  },
  {
    id: '3958dc9e-7f2f-4377-85e9-fec4b6a6442a',
    customer_id: customers[2].id,
    amount: 1000,
    status: 'paid',
    date: '2022-06-05',
  },
];

const revenue = [
  { month: '2024-01-01', revenue: 2000 },
  { month: '2024-02-01', revenue: 1800 },
  { month: '2024-03-01', revenue: 2200 },
  { month: '2024-04-01', revenue: 2500 },
  { month: '2024-05-01', revenue: 2300 },
  { month: '2024-06-01', revenue: 3200 },
  { month: '2024-07-01', revenue: 3500 },
  { month: '2024-08-01', revenue: 3700 },
  { month: '2024-09-01', revenue: 2500 },
  { month: '2024-10-01', revenue: 2800 },
  { month: '2024-11-01', revenue: 3000 },
  { month: '2024-12-01', revenue: 4800 },
];

export { users, customers, invoices, revenue };
