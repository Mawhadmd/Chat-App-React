import Searchbox from './searchbox';
import Contacts from './Contacts';

const LeftSection = () => {
    const contactsList = [];
    for (let i = 0; i < 5; i++) {
      contactsList.push(<Contacts key={i} />);
    }
      return (
        <section className="flex flex-col bg-Main w-96 
        h-screen ">
          <Searchbox/>
          {contactsList}
        
    </section>
    
      )
}

export default LeftSection;
