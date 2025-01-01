Chat App Application (Chatty) Development process:
Planning:
Front End:
1.	Create the interface in Figma (Find a color palate) 
2.	Transform it, exactly as is, to react
3.	After finishing the design, you now will start with backend.
Back End:
1.	Make your own Api, and SQL/No SQL database on your local machine, or just use a Baas
2.	For this project, SupaBase, the way to go.
3.	First thing a Chatty app need is a login system, authorize the user with mobile number? Or google for fast access, or maybe both. 
4.	After the users logs in, he can log out, add contacts, delete contacts, send voice messages, send pictures/files, and interact with the message. (For simplicity start implementing text and then expand)
5.	Then, implement how the user can see other users’ messages, in real time.
Database
1.	Users [userid (AuthUUID), (Listofusers, or just new table (Contacts) that has users related [Userid {FK}, UseridRelated {FK}] – Update: After researching, the former isn’t normalized and efficient enough, therefore I’m going to create a new table Relations[id,userid,relatedid( another userid), timeCreated] (Users tables is handled by Supabase)
2.	Messages [id, content, senderid, receiverid]
3.	We can get the users related with each other’s from the Relations table. But first, how to make them add each others and send messages to each others. 
4.	For the global chat it’ll be global, adding a global Boolean in the messages table.
Update:
Had to remove the global and receiver columns from the messages database, forgot to created the relations database, now created as Contacts [InitiatedContact, ReceiverContact, id, Created_at] Soon to be renamed to Contact1, Contact2 for simplicity. When a user contacts another user, the row is created with 3 prime values, composite key. Whenever the client request a chat, it’ll give them the id of the chat with both sender and receiver id’s. after having the id of this chat, we can access all the messages for the chat by querying the table of PrivateMessages [Contactsid, id, created_at, Content] 

I added to the contacts table a Boolean column to check if the pals have sent messages to each others or not, if they did, then the Boolean will indicate that they’re actively sending messages and add them to the contact list, otherwise chat will not appear on the contact list and will be deleted. I think that is not optimized since entering and leaving chats will cause the database to overload, another approach could be that a user have a state(variable) shared across the modules, this state will register the current user and display it accordingly, the state will reserve the name of the user only, and it will not have any other info. If the user tries to send a message the message will be sent to the server and therefore create a connection. Update: This is also a bad idea, what’s the point of the variable Currentopenchatid If you’re gonna have a variable just to do the same job with a name instead. Maybe we can do the same thing with Currentopenchatid

my latest idea was to have a chat id in the contacts table then query that table and get that id (preferably in a usecontext) when the chat isn’t global. to be able to use it to fetch messages… The contact table can also be used to fetch contacts. Couldn’t have a foreign key for the chatid… now, how can I have 1 row that both users can know that each other are contacts? I think the best option is to have

Results of all this:  
The chatid specify where the messages spawn, and the contacts is for contacts, 1 row per two connected people, the private messages sender and receiver are to specify who exactly sent the message and who did not. It was worth it. But I can’t reach the level of whatsapp sicne they’re paying millions to up their server and are not using javascript for their app. Maybe this app is more similar to whatsapp web.
The Tech Stack:
1.	React JS
2.	Vite 
3.	Node JS
4.	SupaBase for backend (Auth with google and Data Storage) (PostgreSQL)
5.	Tailwind CSS
6.	TypeScript (JavaScript in costume)
Testing:
1.	Not Needed
What will the product offer? 
It’s a clone of WhatsApp, I don’t care what it offers to users (Maybe overstatement that is) … as long as it’s functional, why I did it? Skills.

Features:
•	Google Sign in
•	Global Chat
•	Sound when message is received (Global) 
•	Sound when message is sent
•	Add an online status system (Used supabase realtime websockets)
•	Add is typing status
•	Notifications?
•	Time of the message
•	Time of the last message on contacts
•	Make express server and host it / supabase edge functions – 12 dec
•	Unread messages 
•	Fix LastSeen - 7 dec
•	Add is online and is typing – 7 dec
•	Add is online on global chat – 11 dec
•	Upload images (23 Dec)
•	Recored audio (25 Dec)
•	Private Chat
•	Search for users (Id is in the setting)
•	Settings (Feedback, notifications, sound, support)
•	Video/Voice Chat For next project
•	User Can upload videos

After finishing the project: Describe the integrity:
	
Things that I did wrong then corrected myself: didn’t do a messages component, therefore getting user name for each message was complicated, ended up making a message component and adding unique  users to a map. If a user is already in the map then don’t fetch the database, the message will get the user name by accessing the key of the map which is SenderId => name

The App (Forntend) description:
Alright, I’m wrtting this to know where is my place in this… So, the user logs in, the conditions are satisfied in app.tsx and the user can now interact with the website. There is 9 states and 2 variables 5 functions, 7 useeffects and 3 usecontext in this file:
There are 3 contexts in the app.tsx: 
•	SettingContext: setshowsettings1, MobileMode
•	ChatContext: setCurrentopenchatid,Currentopenchatid,setOtheruserid,Otheruserid,logged,uuid,setcontent,Content,query,setquery,
•	ReloadContactsCtxt: Reloadcontact, setReloadcontact


When the user enters the website and logs in on desktop, he’ll se left section and right section, contact/searchbar and chatarea, I classified them into two sides for easier access the left section contains components: Contacts.tsx (Added contacts ), GlobalChat.tsx(The First Chat),  LeftSection.tsx (Everything in the leftsection, the master mind) and the searchbox (Where search queries and logic happen). The right section is where chat area is: ChatArea.tsx (Messages Load place), ChatInput.tsx(input box), CurrentChat(The top section that tells you where you currenty are), Messages.tsx (the message component) and the rightsection (is their container where all are met together)… A Util folder where we have GetChatid(Backend thingy) and converTime functions.

How the user is supposed to use the app:
The user logs in, finds a friend, or maybe want to chat with people so gets on global chat, there he can find friend and click on their name to chat privately. The user can change to dark/light mode by clicking on their pfp on the top left of the contacts section, the user can see realtime last message on his contacts boxes, the user can send up to 300 characters per message, and can send pictures or audio (Later in the development). To be continued…

How the backend logic works:
This is the part that I’ve been stuck and suffering in, so the app as is written earlier has leftsection and right section, and the App.tsx, the App.tsx handles logging in and the auth state of the user and many general things. The LeftSection with login screen then after login starts with user pfp where he can access the settings, And there is besides it the search box, once the user enter any word into the search box the app will immediately use supabase.auth.admin.getuserlist and then filter() the users by their google or login method usernames, the user is also given small segment of his uuid that he can use to be found easily in the search.  

The query, setquery and setsearchresults, are props passed from leftsection, where the component is called from to be used there, for conditional rendering and loading the results and whatnot

Okay now we know that the searchbox.tsx handles the search and querying the supabase auth admin database searching for users with that name.

The next on the list is The contacts it self, the globalChat also has a supabase auth admin to get a user by id and get their name, Also fetching the latest message which from we whenever a new message arrives into the global chat, a trigger will happened from the channel and the fetchlatestmessage is ran it has supabase read from messages.
Alright now is the Contacts.tsx itself, now here is some deep fried brain cells, the contacts most burden is the latest message, the latest message needs a real time listener (supabase channel) and this merge between search contacts and real contacts that I’ve said I’m gonna separate them and I still am not. Every contact has a listener so that’s gonna be a lot of contacts… There is no supabase admin requests here. The realtime channel runs only if the contact is not in your contacts and this is not search and there is Currentopenchatid??, okay I don’t know what the latter was but apparently we need an open chat for it to work, this might a bug so I’m highlighting the in red for later.

Okay I think we’re done with the leftsection, it’s mostly about getting the last messages for each contact and searching.

Now the right section,  The RightSection.tsx itself is empty tbh, most states shared between components are shared between the right and left sections. One logic is happening here is to display chat only if Currentopenchatid(from App.tsx) is not null and logged(from app.tsx) is true;
If it’s false or the user hasn’t open a chat, it’ll either tell the user to log in or tell them to choose a chat depending on the logged variable. And that is it. 

The next on the list, since we’re starting from top to bottom is the currentchat.tsx, This is honestly an empty component, except it has a realtime listener to check if the user is online or not, only for non global contact, and has a Goback button for MobileMode State if it is true. Proped down from app.tsx..

The Chat Area is also non intensive area Check for messages (limit 30) and put them down, and along the way if the realtime channel detects a new message it will just add it to the client side and under the hood on the server, also in here I’m playing audio for Global once a message is added to the map the channels Supabase Channel “Changes-in-chatArea-Global” And “Changes-in-chatArea-Private” get the postgres changes to the client, The private chat gets message from both sender and receiver and merges them, I’m using a Map to get the data of the users for each message {ID: data}, and passes it to the Message.tsx along with uuid,index,data,SetUserMessageMap(For new users) which is the next paragraph. Supabase auth admin is used to fill the map.

The message.tsx gets the message data that are not in the message database, like username and user id and name and color, the color is null so it has a function to uniquely assign a color for each user in the map, the map keys are unique so each user has his own color once, the other function the works with colors is contrastration calculater where I think and I’m not sure about it it gets the lumanity of the rgp to the human eye and does a calculation if it’s above 4 and below 7 then it’s a good thing, but that’s not a backend thing, there is nothing here that uses supabase, except when a user that doesn’t exist in the usersmap, this is where i need to access the getuserbyid method and put the user in the map, add them to the map. 


And yeah that’s it, we’ve seen like 5 supabase admin usages? And 5 channels for all components, x channels for x contacts that get the last message, 1 channel that gets the last seen,2 channel that gets the latest messages/Messages in global , and 2 Channels  that get the messages/lastmessage in private chats. 

And that’s it,
Now the problem is we have to hide the secret role key, or use the anon key, but we have to in a way or another to use the secret role key in which we can get userlist and getuserbyid and so on.. Now the anon key is public, and I can restrict it to read only, so anyone can do anything with it I don’t care, now the secret key must be in a secret place, a backend, the backend is protected by CORS, and We can do multiple endpoints: InsertMessage -  SearchForuser – ForNow, Wow, That is it. 


Projects problems with react:

Had a problem where the fetching of contacts was weirdly sorting an array, which later caused using the index as key bug out. The fetch add the two array together, it doesn’t add them in order, so the new contact to the place of the previous contact and the data and reference were everywhere, This was solveable by adding a dependency to the useeffect that was messing the data and getting the wrong dependencies, but this is an easy fix, I wanted to go deaper. This is what I said:
“
1.	Okay, I'm now more confused. I changed the key to chatid, and now it works as if I added a dependency. The index isn't changing, as far as I know. (edited)
2.	[4:31 PM]
well
3.	[4:31 PM]
maybe it is
4.	[4:31 PM]
maybe
5.	[4:32 PM]
maybe i now get it, the new contact is taking the place of an existing contact by the key (index) so it's not considering it new to remount. In other words, suppose the new guy is 50 and the old one is 30 at index 3, 50 gets on index 3 and 30 is deemed new at index 4 (index 4 doesn't exist). The 50 is getting all 30's attributes and the 30 is getting new mount. it all comes down to the weird 
“
Why did the useEffect dependency work? Will, basically the useEffect dependency checks if the chatid changes, since it actually changed, the useeffect runs again, but what about the guy who we took his place? Well, he’s got a totally new component with his own new index (that was before I change the key to chatid) And that is the problem actually, hoping to endive more in the MERN or PERN or what even stack.

Added Away feature, sending status with the tracking and added event listeners to check onfocus/onblur. These stuff are generally said on github commits so I’m not gonna include it here

Adding the files feature on the app, I added the logical work and now the database and backend, the user clicks upload, I will add a new property(MessageContent) if any on the File object so It can be carried with it. First will have to display the message by setting message optimisticly, then sending it to the storage and then to the messages table, setting the message optimisticly will need us to figure a new object structure for the message.. Maybe new File/Image property for the object? If it’s not null then there is an image that must be displayed
How do I know if the other user has seen the message and now the message is read? An accurate approach would be to check each message appearance on the screen and if it is on the screen then a request will be sent, unironically this will fuck the server up, alternative way is to update all the messages on receive, but how? We need to update from the receiver side, so we have to only send the messages that are received, to the server, ahh.






