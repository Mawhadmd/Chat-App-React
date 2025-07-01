# Chatty (Abandoned)

This project is a modern chat app that has many features, including authorization, authentication, real-time, image/audio sharing, and more. 

### Why I built it

I loved the idea of having my own chat app, use it to talk with friends while knowing exactly how each message is reaching the other side. I built a simple chat app back in my junior years using PHP and Ajax, but it wasn't real-time; instead, it was polling every couple of seconds. I consider this an upgrade of that and my most comprehensive project as of July 1, 2025, and I would love to create more projects and applications like this.

### How I built it

I started building this project to learn React more comprehensively, purpose was achieved. I also learned:

- Tailwind
- SCSS
- Deploying
- Continuous integration
- Real-time interaction in apps
- Supabase
- TypeScript
- and More

### Issues

Although the chatting mechanism and real-time functionality are working correctly, a couple of issues, or bugs, have been noticed while using the app. But, since the project has been abandoned, I didn't bother to fix it. 

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
cd ..
```

3- Add env variables
for server
```
SUPABASE_KEY="Your Key"
SUPABASE_URL="Your URL"
PORT=8080
```

3.5- Database schema for supabase
```
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE public.Users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  LastSeen text NOT NULL
);

-- Contacts table
CREATE TABLE public.Contacts (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  User1 uuid NOT NULL,
  User2 uuid NOT NULL,
  chatId bigserial PRIMARY KEY,
  CONSTRAINT fk_user1 FOREIGN KEY (User1) REFERENCES public.Users(id),
  CONSTRAINT fk_user2 FOREIGN KEY (User2) REFERENCES public.Users(id)
);

-- Messages table
CREATE TABLE public.Messages (
  id bigserial PRIMARY KEY,
  Sender uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  Content text NOT NULL,
  CONSTRAINT fk_sender_messages FOREIGN KEY (Sender) REFERENCES public.Users(id)
);

-- PrivateMessages table
CREATE TABLE public.PrivateMessages (
  id bigserial PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  Content text NOT NULL DEFAULT '',
  Receiver uuid NOT NULL,
  Sender uuid NOT NULL,
  chatId bigint NOT NULL,
  FileURL text,
  AudioFile text,
  ReadAt timestamp with time zone,
  CONSTRAINT fk_receiver FOREIGN KEY (Receiver) REFERENCES public.Users(id),
  CONSTRAINT fk_sender FOREIGN KEY (Sender) REFERENCES public.Users(id),
  CONSTRAINT fk_chat FOREIGN KEY (chatId) REFERENCES public.Contacts(chatId)
);
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
