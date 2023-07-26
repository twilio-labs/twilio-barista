import { h, Component } from 'preact';
import OrderItem from '../order-item';
import style from './style.less';

export default class OrderList extends Component {
  render() {
    const entries = this.props.orders.map(order => {
      return <OrderItem order={order} done={order.status !== 'open'} />;
    });
    const noEntries = (
      <div class={style.emptyOrders}>
        <p class={style.noCoffeeText}>No Open Orders</p>
      </div>
    );
    return (
      <div>
        {this.props.orders.length === 0 ? noEntries : entries}
      </div>
    );
  }
}
