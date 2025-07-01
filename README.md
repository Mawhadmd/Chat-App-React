# Chatty (Abandoned)

This project is a modern Chat-App that has many features, including authorization, authentication, real-time, image/audio sharing, and more. 

### Why I built it

I loved the idea of having my own chat app, use it to talk with friends while knowing exactly how each message is reaching the other side. I actually built a simple chat app back in my junior years using PHP and Ajax, but it wasn't real-time; instead, it was polling every couple of seconds. I consider this my most comprehensive project as of july first 2025, and i would love to create more projects and application like this.

### How I built it

I started building this project with the purpose of learning React more comprehensively, purpose was achieved. I also learned:

- Tailwind
- SCSS
- Deploying
- Continuous integration
- Real-time interaction in apps
- Supabase
- TypeScript

### Issues

Although the chatting mechanism and real time is working correctly, there are a couple of issues, or bugs, that've been noticed while using the app. But, since the project has been abandoned, I didn't bother to fix it. 

## Requirements

To use the app, you need:

- A Google account

### How to run

1- Clone it
```
git clone https://github.com/Mawhadmd/Chat-App-React
cd Chat-App-React
```

2- Install dependencies
```
cd server
npm install

cd ../client
npm install
```

3- Add env variables
for server
```
SUPABASE_KEY="Your Key"
SUPABASE_URL="Your URL"
PORT=8080
```


4- Config
In your client code, replace any links pointing to the hosted (Render) server with:
from `https://chat-app-react-server-qizz.onrender.com` to `http://localhost:8080`

5- Finally, run it
```
cd server
npm run start

cd ../client
npm run dev
```
## Useful Resources

I wrote detailed notes throughout the project, basically my thought process. It’s quite lengthy:
(**Project Docs**)[https://1drv.ms/w/c/8b1e0522eb787e4e/EcqqgVzc1qlOhW9vCiE0JiUBwFTE-zcC_fSKoAGOU3MVJg?e=x5wcau]
