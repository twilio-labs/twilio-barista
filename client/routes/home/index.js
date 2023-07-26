import { h, Component } from 'preact';
import { Link } from 'preact-router';
import mdl from 'material-design-lite/material';
import { Card, Button, Progress } from 'preact-mdl';
import style from './style';

export default class Home extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      events: undefined,
    };
  }

  async componentWillMount() {
    const { events } = await (await fetch(
      '/api/admin/events?type=full&visible=true'
    )).json();
    this.setState({ events });
  }

  renderEvents() {
    if (!this.state.events || !Array.isArray(this.state.events)) {
      return <Progress indeterminate />;
    }

    if (this.state.events.length === 0) {
      return (
        <div>
          <h5>No events found.</h5>
          <p>Please create an event in the admin section</p>
        </div>
      );
    }

    return this.state.events.map(({ eventId, eventName }) => (
      <EventEntry eventId={eventId} name={eventName} />
    ));
  }

  render() {
    return (
      <div class={style.home}>
        <h2>Twilio Smoothies</h2>
        <p>Welcome to Twilio Smoothies. Please pick your event:</p>
        <div class={style.container}>{this.renderEvents()}</div>
      </div>
    );
  }
}

const EventEntry = ({ eventId, name }) => {
  return (
    <Card shadow={2} class={style.eventEntry}>
      <Card.Title>
        <Card.TitleText>{name}</Card.TitleText>
      </Card.Title>
      <Card.Text>Event ID: {eventId}</Card.Text>
      <Card.Actions>
        <Link href={`/${eventId}/orders`}>
          <Button primary class={style.actionButton}>
            📝 Orders
          </Button>
        </Link>
        <Link href={`/${eventId}/kiosk`}>
          <Button primary class={style.actionButton}>
            📱 Kiosk
          </Button>
        </Link>
        <Link href={`/${eventId}/dashboard`}>
          <Button primary class={style.actionButton}>
            📊 Dashboard
          </Button>
        </Link>
      </Card.Actions>
    </Card>
  );
};

