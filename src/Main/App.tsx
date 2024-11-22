import Contacts from "./LeftSection/Contacts"
import Searchbox from "./LeftSection/searchbox"

function App() {
  const contactsList = [];
for (let i = 0; i < 5; i++) {
  contactsList.push(<Contacts key={i} />);
}
  return (
    <div className="flex flex-col bg-Main w-96 
    h-screen ">
      <Searchbox/>
      {contactsList}
    
</div>

  )
}

export default App
