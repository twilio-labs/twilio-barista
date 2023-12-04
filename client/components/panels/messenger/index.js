import { h, Component } from 'preact';
import mdl from 'material-design-lite/material';
import { TextField, Radio, Button, Card, Chip } from 'preact-mdl';

import style from './style';

export default class Messenger extends Component {
  constructor(...args) {
    super(...args);
    this.state.sendTo = 'all';
    this.state.events = [];
  }

  async componentWillMount() {
    const { events } = await (await fetch(
      '/api/admin/events?type=full'
    )).json();
    this.setState({ events });
  }

  sendMessage(evt) {
    evt.preventDefault();
    const { sendTo, message, identity, selectedEvent } = evt.target;

    const data = {
      sendTo: sendTo.value,
      message: message.value,
    };
    if (sendTo.value.indexOf('ForEvent') !== -1) {
      console.log(selectedEvent);
      data.eventId = selectedEvent.value;
    }
    if (identity) {
      data.identity = identity.value;
    }
    fetch('/api/admin/message', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then(resp => {
        if (resp.ok) {
          return resp.json();
        } else {
          throw new Error('Failed request');
        }
      })
      .then(data => {
        this.setState({
          sendTo: 'all',
          message: undefined,
          identity: undefined,
          messageSent: true,
        });
        setTimeout(() => {
          this.setState({ messageSent: undefined });
        }, 5000);
      })
      .catch(err => {
        console.error(err);
      });
  }

  handleInputChange(evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  }

  render() {
    return (
      <div>
        <h4>Send a message</h4>
        <form onSubmit={evt => this.sendMessage(evt)}>
          <Card class={style.card} shadow="2">
            <Card.Text>
              <div class={style.radioContainer}>
                <Radio
                  name="sendTo"
                  value="all"
                  checked={this.state.sendTo === 'all'}
                  onChange={evt => this.handleInputChange(evt)}
                >
                  All
                </Radio>
                <Radio
                  name="sendTo"
                  value="activeOrders"
                  checked={this.state.sendTo === 'activeOrders'}
                  onChange={evt => this.handleInputChange(evt)}
                >
                  All Active Orders
                </Radio>
                <Radio
                  name="sendTo"
                  value="allForEvent"
                  checked={this.state.sendTo === 'allForEvent'}
                  onChange={evt => this.handleInputChange(evt)}
                >
                  Everyone For Event
                </Radio>
                <Radio
                  name="sendTo"
                  value="activeOrdersForEvent"
                  checked={this.state.sendTo === 'activeOrdersForEvent'}
                  onChange={evt => this.handleInputChange(evt)}
                >
                  Active Orders For Event
                </Radio>
            
              </div>
            
              {this.state.sendTo.indexOf('ForEvent') !== -1 &&
                this.renderSelector()}
              <div>
                <TextField
                  class={style.messageInput}
                  multiline
                  name="message"
                  onChange={evt => this.handleInputChange(evt)}
                  value={this.state.message}
                >
                  Type your message...
                </TextField>
              </div>
            </Card.Text>
            <Card.Actions class="mdl-card--border">
              <Button raised primary type="submit">
                Send Message
              </Button>
              {this.state.messageSent && (
                <span class="mdl-chip">
                  <span class="mdl-chip__text">
                    Your message has been sent!
                  </span>
                </span>
              )}
            </Card.Actions>
          </Card>
        </form>
      </div>
    );
  }

  renderSelector() {
    const eventOptions = this.state.events.map(x => (
      <option value={x.eventId}>{x.eventName}</option>
    ));
    return (
      <div class={style.eventSelector}>
        <label for="eventPicker">Pick your event</label>
        <select id="eventPicker" name="selectedEvent" class="mdc-select">
          {eventOptions}
        </select>
      </div>
    );
  }
}
