// import express from "express";
// import * as dotenv from "dotenv";
// import { createClient } from '@supabase/supabase-js'

// dotenv.config();
// dotenv.config({ path: `.env.local`, override: true });
// const app = express();

// app.post('/getclient',(req,res)=>{

// const supabaseUrl = 'https://qfwtyzdwghkqeumbccer.supabase.co'
// const supabaseKey = process.env.VITE_SUPABASE_KEY
// var supabase
// if(supabaseKey)
//  supabase = createClient(supabaseUrl, supabaseKey)
// else
// return res.status(500).send('Key was not found')
// return res.status(200).send(supabase) 
// })

// app.listen(process.env.PORT, () => {
//     console.log('Listening on', process.env.PORT);
// });
