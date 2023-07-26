import { h, Component } from 'preact';

import TwilioLogo from '../../components/twilio-logo';
import style from './style';
import eventConsts from '../../../shared/event-type-consts';

export default class Kiosk extends Component {
  constructor(...args) {
    super(...args);
    this.state.kioskLoaded = false;
    this.state.kioskInfo = {};
    this.state.error = undefined;
  }

  componentWillMount() {
    const { eventId } = this.props;
    fetch(`/api/kiosk?eventId=${eventId}`)
      .then(resp => {
        if (!resp.ok) {
          throw new Error('Could not fetch kiosk info');
        }
        return resp.json();
      })
      .then(kioskInfo => {
        this.setState({ kioskInfo, kioskLoaded: true });
      })
      .catch(err => {
        console.error(err);
        this.setState({ kioskLoaded: false, error: err.message });
      });
  }

  render() {
    const { kiosk } = eventConsts(this.state.kioskInfo.eventType);
    const loading = <p>Loading...</p>;
    return !this.state.kioskLoaded ? (
      loading
    ) : (
      <div id="kiosk" class={style.kiosk}>
        <h1 class={style.thirsty}>{kiosk.title}</h1>
        <p class={style.hr}>Skip the Queue!</p>
        <div class={style.centerContent}>
          <p>{kiosk.tagLine}</p>
          <p>Send your order via WhatsApp to:</p>
          <div class={style.phoneNumbers}>
            {this.state.kioskInfo.phoneNumbers.slice(0, 4).map(num => (
              <p>
                {num.emoji} {num.phoneNumber}
              </p>
            ))}
          </div>
        </div>
        <p class={style.hr}>Menu</p>
        <div>
          {this.state.kioskInfo.menuItems.map((product) => <p class={style.menuItems}>{product}</p>)}
          <p class={style.menuDetails}>{this.state.kioskInfo.menuDetails}</p>
        </div>
        <p class={style.hr}>Enjoy</p>
        <p>
          <TwilioLogo />
        </p>
      </div>
    );
  }
}
