import { Component } from 'preact';
import { Progress, Tabs } from 'preact-mdl';
import Configurator from '../../components/panels/configurator';
import EventConfigurator from '../../components/panels/event-configurator';
import Messenger from '../../components/panels/messenger';
import Metrics from '../../components/panels/metrics';
import Other from '../../components/panels/other';
import ConfigService from '../../lib/config';
import style from './style';

export default class Orders extends Component {
  constructor(...args) {
    super(...args);

    this.state.events = undefined;
    this.state.config = undefined;
    this.state.eventConfig = undefined;
    this.configService = ConfigService.shared();
    this.configService.on('updatedGlobal', ({ config }) => {
      this.setState({ config });
    });
    this.configService.on('updatedEvent', ({ eventConfig }) => {
      this.setState({ eventConfig });
    });
  }

  async componentDidMount() {
    try {
      const { events } = await (await fetch('/api/admin/events')).json();
      this.eventId = events[0];
      const { config, eventConfig } = await this.configService.init(
        this.eventId
      );
      this.setState({
        events,
        config,
        eventConfig,
      });
    } catch (err) {
      console.log('Failed to initialize Admin');
      console.error(err);
    }
  }

  render() {
    let noAdminMessage = <p>You are not admin</p>;
    let adminInterface = (
      <Tabs>
        <Tabs.TabBar class={style.tabsLeft}>
          <Tabs.Tab href="#configuration" active>
            Configuration
          </Tabs.Tab>
          <Tabs.Tab href="#events">Events</Tabs.Tab>
          <Tabs.Tab href="#metrics">Metrics</Tabs.Tab>
          {/* <Tabs.Tab href="#messages">Messages</Tabs.Tab> */}
          <Tabs.Tab href="#other">Other</Tabs.Tab>
        </Tabs.TabBar>
        <Tabs.TabPanel id="configuration" active>
          <h4>Global Configuration</h4>
          {this.state.config ? (
            <Configurator
              config={this.state.config}
              update={(key, value) => this.updateConfig(key, value)}
            />
          ) : (
            <Progress indeterminate />
          )}
        </Tabs.TabPanel>
        <Tabs.TabPanel id="events">
          <h4>Event Configuration</h4>
          <EventConfigurator
            events={this.state.events}
            currentEventId={this.eventId}
            currentEventConfig={this.state.eventConfig}
            onEventChange={this.changeEvent.bind(this)}
            onResetEvent={this.resetEventStats.bind(this)}
            onDeleteEvent={this.deleteEvent.bind(this)}
            onCreateEvent={this.createEvent.bind(this)}
            onUpdateEventConfig={this.updateEventConfig.bind(this)}
            onCancelOrders={this.cancelAllOpenOrders.bind(this)}
          />
        </Tabs.TabPanel>
        <Tabs.TabPanel id="metrics">
          <Metrics events={this.state.events} />
        </Tabs.TabPanel>
        <Tabs.TabPanel id="messages">
          <Messenger />
        </Tabs.TabPanel>
        <Tabs.TabPanel id="other">
          <Other />
        </Tabs.TabPanel>
      </Tabs>
    );
    return (
      <div class={style.admin}>
        <h4>Admin</h4>
        {this.props.isAdmin ? adminInterface : noAdminMessage}
      </div>
    );
  }

  renderEventsTab() {}

  updateConfig(key, value) {
    this.configService.updateValue(key, value);
  }

  updateEventConfig(key, value) {
    this.configService.updateValue(key, value, 'event');
  }

  changeEvent(eventId) {
    this.eventId = eventId;
    this.configService.changeEvent(this.eventId);
  }

  async deleteEvent() {
    const eventId = this.eventId;
    try {
      const resp = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!resp.ok) {
        console.error('Failed to delete event');
        return;
      }
    } catch (err) {
      console.error('Failed to make delete request');
      return;
    }

    const events = this.state.events.filter(event => event !== eventId);
    this.eventId = events[0];
    this.setState({ events });
    if (this.eventId) {
      this.configService.changeEvent(this.eventId);
    } else {
      this.setState({ eventConfig: undefined });
    }
  }

  async resetEventStats() {
    const eventId = this.eventId;
    try {
      const resp = await fetch(
        `/api/admin/reset?action=stats&eventId=${eventId}`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );
      if (resp.ok) {
        console.log('Reset stats');
      } else {
        throw new Error(resp.statusText);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async cancelAllOpenOrders() {
    try {
      const resp = await fetch(
        `/api/admin/reset?action=openOrders&eventId=${this.eventId}`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );
      if (resp.ok) {
        console.log('Cleared queue');
      } else {
        throw new Error(resp.statusText);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async createEvent(eventName) {
    try {
      const resp = await fetch('/api/admin/events', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ eventName }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!resp.ok) {
        console.error('Failed to create event');
        return;
      }
      this.eventId = (await resp.json()).eventId;
    } catch (err) {
      console.log('Failed to make create request');
      console.error(err);
      return;
    }

    const events = [...this.state.events, this.eventId];
    this.setState({ events });
    this.configService.changeEvent(this.eventId);
  }
}
