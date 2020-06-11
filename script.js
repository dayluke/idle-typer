class IdleTyper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cookiesEnabled: false,
      characters: 0,
      urlIndex: 0,
      typerUrls: [
        "https://raw.githubusercontent.com/torvalds/linux/master/fs/ext4/acl.c",
        "https://raw.githubusercontent.com/torvalds/linux/master/init/main.c"
      ],
      typerIndex: 0,
      typerSpeed: 1,
      currentFileText: "",
      currentCodeText: "",
      autoTypers: 0
    };
        
    this.getNextFile();
    window.addTyper = this.addTyper.bind(this);
    window.onKeyPressed = this.keyPressed.bind(this);
  }

  cookiesAccepted() {
    this.setState(state => ({
      cookiesEnabled: true
    }));
    this.loadCookies();
  }

  loadCookies() {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      if (cookie.indexOf("characters=") != -1) {
        var cookieCharacters = parseInt(cookie.substring("characters=".length + 1, cookie.length));
        if (!Number.isNaN(cookieCharacters)) {
          this.setState(state => ({
            characters: cookieCharacters 
          }));
        }
      }
      else if (cookie.indexOf("autotypers=") != -1) {
        var cookieTypers = parseInt(cookie.substring("autotypers=".length, cookie.length));
        if (!Number.isNaN(cookieTypers)) {
          this.setState(state => ({
            autoTypers: cookieTypers 
          }));
        }
      }
    }
    
    this.saveCookies();
  }
  
  saveCookies() {
    if (this.state.characters > 0) {
      document.cookie = "characters=" + this.state.characters;
    }
    
    if (this.state.autoTypers > 0) {
      document.cookie = "autotypers=" + this.state.autoTypers;
    }
  }
  
  keyPressed() {
    this.setState(state => ({
      characters: state.characters + state.typerSpeed,
      typerIndex: state.typerIndex + state.typerSpeed
    }));
    
    this.checkForEndOfFile();
    
    this.scrollBottom();
    this.updateCodeText();
  }
  
  checkForEndOfFile() {
    if (this.state.typerIndex >= this.state.currentFileText.length - 1) {
      // Done with this file.
      // Move onto the next.
      if (this.state.urlIndex < this.state.typerUrls.length - 1) {
        this.changeFile();
      }
      else {
        // We reached the end of the files.
        // So start again from the beginning.
        this.setState(state => ({
          urlIndex: 0,
          typerIndex: 0
        }));
        
        this.getNextFile();
      }
    }
  }
  
  changeFile() {
    this.setState(state => ({
      urlIndex: state.urlIndex + 1,
      typerIndex: 0
    }));

    this.getNextFile();
  }
  
  getNextFile() {
    $.get(this.state.typerUrls[this.state.urlIndex], (data) => {
      this.state.currentFileText = data;
    });
  }
  
  updateCodeText() {
    this.setState(state => ({
      currentCodeText: state.currentFileText.toString().substring(state.typerIndex, 1)
    }));
  }
  
  scrollBottom() {
    $('html, body').scrollTop($(document).height());
  }

  tick() {
    this.setState(state => ({
      characters: state.characters + state.autoTypers,
      typerIndex: state.typerIndex + state.autoTypers
    }));
    this.scrollBottom();
    this.updateCodeText();
    this.checkForEndOfFile();
    this.saveCookies();
  }
  
  addTyper(cost, typerIncrease) {
    if (cost < this.state.characters) {
      this.setState(state => ({
        characters: state.characters - cost,
        autoTypers: state.autoTypers + typerIncrease
      }));
    }
    else {
      alert("You don't currently have enough characters");
    }
  }

  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 1000);
    if (this.state.cookiesEnabled) {
      this.loadCookies();
      window.addEventListener("beforeunload", this.saveCookies);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    if (this.state.cookiesEnabled) {
      window.removeEventListener("beforeunload", this.saveCookies);
    }
  }
  
  render() {
    return (
      <div>      
        <div className="shop-container">
          <button onClick={() => { this.addTyper(250, 1); }}>Buy Auto-Typer - 250 characters</button>
          <button onClick={() => { this.addTyper(1000, 5); }}>Buy Hacker - 1000 characters</button>
          <button onClick={() => { this.addTyper(10000, 60); }}>Buy Server Rack - 10000 characters</button>
          <button onClick={() => { this.addTyper(50000, 300); }}>Buy Super Computer - 50000 characters</button>
        </div>
        <h3>Characters: {this.state.characters}</h3>
        <p>{this.state.currentCodeText}</p>
      </div>
    );
  }
}
  
ReactDOM.render(
  <IdleTyper ref={(typerComponent) => {window.typerComponent = typerComponent}}/>,
  document.getElementById('idle-typer')
);

class CookiePopup extends React.Component {
  constructor(props) {
    super(props);

    this.acceptCookies = this.acceptCookies.bind(this);
  }

  acceptCookies() {
    window.typerComponent.cookiesAccepted();
    var container = document.getElementById('cookie-container');
    container.remove();
  }

  render() {
    return (
      <div id="cookie-popup">
        <p>Cookies and Privacy</p>
        <p>This game uses cookies to save your progress.</p>
        <button onClick={this.acceptCookies}>I accept</button>
      </div>
    );
  }
}

ReactDOM.render(
  <CookiePopup />,
  document.getElementById('cookie-container')
);
  
document.addEventListener('keydown', window.onKeyPressed);
document.addEventListener('touchstart', window.onKeyPressed);