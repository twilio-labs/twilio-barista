import { h, Component } from 'preact';
import mdl from 'material-design-lite/material';
import { TextField, Switch, Button } from 'preact-mdl';

import { DEFAULT_JSON_ENTRY_KEY } from '../../../../shared/consts';
import style from './style';

export default class Configurator extends Component {
  render() {
    const { config } = this.props;
    const entries = Object.keys(config)
      .filter(key => key !== "mode" && key !== "fullMenu") // hide these props in the UI
      .sort((a, b) => this.sortConfig(config, a, b))
      .map(configName => {
        const value = config[configName];
        if (typeof value === 'boolean') {
          return this.createBooleanInput(configName, value);
        } else if (Array.isArray(value)) {
          return this.createArrayInput(configName, value);
        } else if (typeof value === 'object' && configName === "availableMenu") {
          return this.createMenuToggle(configName, value);
        } else if (typeof value === 'object') {
          return this.createJsonInput(configName, value);
        } else {
          return this.createTextInput(configName, value);
        }
      });
    return <div class={style.configList}>{entries}</div>;
  }

  createTextInput(key, value) {
    return (
      <div class={style.configEntry}>
        <TextField
          floating-label={true}
          label={key}
          type="text"
          name={key}
          value={value}
          onChange={evt => this.handleInputChange(evt)}
        />
      </div>
    );
  }

  createBooleanInput(key, value) {
    return (
      <div class={style.configEntry}>
        <Switch
          type="checkbox"
          name={key}
          checked={value}
          onChange={evt => this.handleInputChange(evt, key)}
        >
          {key}
        </Switch>
      </div>
    );
  }

  createArrayInput(key, value) {
    return (
      <div class={style.configEntry}>
        <TextField
          floating-label={true}
          label={key}
          type="text"
          name={key}
          value={value.join(', ')}
          onChange={evt => this.handleArrayInputChange(evt)}
        />
      </div>
    );
  }

  createJsonInput(key, value) {
    const keys = Object.keys(value);
    const type = typeof value[keys[0]];
    const entries = keys.map((objectKey, idx) => {
      const objectValue = value[objectKey];
      let input =
        typeof objectValue === 'boolean' ? (
          <Switch
            class={style.jsonSwitch}
            checked={objectValue}
            onChange={evt =>
              this.handleJsonValueChange(key, value, objectKey, evt)
            }
          />
        ) : (
          <TextField
            class={style.jsonInput}
            placeholder="value"
            value={objectValue}
            onChange={evt =>
              this.handleJsonValueChange(key, value, objectKey, evt)
            }
          />
        );
      return (
        <div class={style.jsonEntry}>
          <Button
            class={style.deleteButton}
            colored
            accent
            onClick={() => this.deleteJsonEntry(key, value, objectKey)}
          >
            &times;
          </Button>
          <TextField
            class={style.jsonKey}
            placeholder="key"
            value={objectKey}
            onChange={evt => this.handleJsonKeyChange(key, value, idx, evt)}
          />
          <span class={style.jsonSpacer}>:</span>
          {input}
        </div>
      );
    });
    return (
      <div class={style.configEntry}>
        <h6 class={style.jsonHeadline}>{key}</h6>
        <div class={style.jsonList}>{entries}</div>
        <div class={style.createNewJsonEntryButtons}>
          {type !== 'boolean' && (
            <Button
              primary
              colored
              onClick={() => this.createNewJsonEntry(key, value)}
            >
              Create Text Entry
            </Button>
          )}
          {type === 'boolean' && (
            <Button
              primary
              colored
              onClick={() => this.createNewJsonEntry(key, value, false)}
            >
              Create Boolean Entry
            </Button>
          )}
        </div>
      </div>
    );
  }

  createMenuToggle(key, value) {
    const keys = Object.keys(value);
    const entries = keys.map((objectKey, idx) => {
      const objectValue = value[objectKey];
      return (
        <div class={style.jsonEntry}>
          <Button
            class={style.deleteButton}
            colored
            accent
            onClick={() => this.deleteJsonEntry(key, value, objectKey)}
          >
            &times;
          </Button>
          <span class={style.jsonHeadline}>{objectKey}</span>
          <span class={style.jsonSpacer}>:</span>
          <Switch
            class={style.jsonSwitch}
            checked={objectValue}
            onChange={evt =>
              this.handleJsonValueChange(key, value, objectKey, evt)
            }
          />
        </div>
      );
    });
    return (
      <div class={style.configEntry}>
        <h6 class={style.jsonHeadline}>{key}</h6>
        <div class={style.jsonList}>{entries}</div>
      </div>
    );
  }

  handleInputChange(evt, optName) {
    const target = evt.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = optName || target.name;

    this.props.update(name, value);
  }

  handleArrayInputChange(evt) {
    let { value, name } = evt.target;
    value = value
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    this.props.update(name, value);
  }

  handleJsonKeyChange(name, obj, idx, evt) {
    const newKey = evt.target.value;
    const oldKey = Object.keys(obj)[idx];
    const entryValue = obj[oldKey];
    obj[newKey] = entryValue;
    delete obj[oldKey];
    this.props.update(name, obj);
  }

  handleJsonValueChange(name, obj, key, evt) {
    const newValue =
      evt.target.type === 'checkbox' ? evt.target.checked : evt.target.value;
    obj[key] = newValue;
    this.props.update(name, obj);
  }

  createNewJsonEntry(name, obj, value) {
    value = typeof value === 'undefined' ? 'CHOOSE_VALUE' : value;
    obj[DEFAULT_JSON_ENTRY_KEY] = value;
    this.props.update(name, obj);
  }

  deleteJsonEntry(name, obj, key) {
    delete obj[key];
    this.props.update(name, obj);
  }

  sortConfig(config, configNameA, configNameB) {
    const valueA = config[configNameA];
    const valueB = config[configNameB];
    const typeA = typeof valueA;
    const typeB = typeof valueB;
    if (typeA === typeB) {
      if (configNameA > configNameB) {
        return 1;
      } else if (configNameA < configNameB) {
        return -1;
      } else {
        return 0;
      }
    } else if (typeA === 'boolean') {
      return -1;
    } else if (typeB === 'boolean') {
      return 1;
    } else if (typeA === 'string') {
      return -1;
    } else if (typeB === 'string') {
      return 1;
    } else if (typeA === 'number') {
      return -1;
    } else if (typeB === 'number') {
      return 1;
    } else if (typeA === 'object' && !Array.isArray(valueA)) {
      return -1;
    } else if (typeB === 'object' && !Array.isArray(valueB)) {
      return 1;
    } else {
      if (configNameA > configNameB) {
        return 1;
      } else if (configNameA < configNameB) {
        return -1;
      } else {
        return 0;
      }
    }
  }
}
