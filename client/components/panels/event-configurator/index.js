import { Component } from 'preact';
import { Button, Progress, TextField } from 'preact-mdl';
import Configurator from '../configurator';
import style from './style';

const CreateEventForm = ({ onNewEvent }) => {
  function onSubmit(evt) {
    evt.preventDefault();
    const eventNameInput = evt.target.eventName;
    const modeInput = evt.target.mode;

    onNewEvent(eventNameInput.value, modeInput.value);
    eventNameInput.value = '';
    modeInput.value = '';
  }

  return (
    <form onSubmit={onSubmit} class={style.eventForm}>
      <h5>Create a new event</h5>
      <p>
        Pick a name for the event. This name might be shown to the attendees.
      </p>
      <TextField
        floating-label={true}
        label="Event Name"
        type="text"
        name="eventName"
        value=""
        class={style.eventFormNameInput}
      /> <TextField
        floating-label={true}
        label="Event Mode"
        type="text"
        name="mode"
        value=""
        class={style.eventFormNameInput}
      />
      <Button primary raised type="submit">
        Create
      </Button>
      <hr />
    </form>
  );
};

export default class EventConfigurator extends Component {
  render() {
    const {
      events,
      currentEventId,
      currentEventConfig,
      onEventChange,
      onResetEvent,
      onDeleteEvent,
      onCreateEvent,
      onUpdateEventConfig,
      onCancelOrders,
    } = this.props;
    const eventOptions = events ? events.map(x => (
      <option selected={x === currentEventId}>{x}</option>
    )) : [];
    const selectEventOptions = (
      <div class={style.eventSelector}>
        <label for="eventPicker">Pick your event</label>
        <select
          id="eventPicker"
          class="mdc-select"
          value={currentEventId}
          onChange={evt => onEventChange(evt.target.value)}
        >
          {eventOptions}
        </select>
      </div>
    );
    const eventActionButtons = (
      <div>
        <h5>Other Actions</h5>
        <p><strong>Important:</strong> Please make sure to only delete the event if there is nobody using the system right now.</p>
        <Button raised accent onClick={onResetEvent}>
          Reset Stats
        </Button>
        <Button accent onClick={onDeleteEvent}>
          Delete Event
        </Button>
        <Button accent onClick={onCancelOrders}>
          Cancel All Orders
        </Button>
      </div>
    );
    const eventConfigurator = (
      <div>
        <h5>Event Configuration</h5>
        {currentEventConfig ? (
          <Configurator
            config={currentEventConfig}
            update={onUpdateEventConfig}
          />
        ) : (
          <p>There are no events, please create one above.</p>
        )}
        {currentEventConfig && eventActionButtons}
      </div>
    )
    return (
      <div>
        <CreateEventForm onNewEvent={onCreateEvent} />
        {events && events.length > 0 && selectEventOptions}
        {events ? eventConfigurator : (<Progress indeterminate />)}
      </div>
    );
  }
}
