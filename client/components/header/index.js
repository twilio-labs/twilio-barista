import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import style from './style';

export default class Header extends Component {
  render() {
    const adminLink = this.props.isAdmin && (
      <Link activeClassName={style.active} href="/admin">
        Admin
      </Link>
    );
    // const ordersLink =
    //   this.props.isLoggedIn &&
    //   <Link activeClassName={style.active} href="/orders">
    //     Orders
    //   </Link>;
    return (
      <header class={style.header}>
        <h1>Twilio Bar</h1>
        <nav>
          <Link activeClassName={style.active} href="/">
            Home
          </Link>
          {/* {ordersLink} */}
          {adminLink}
        </nav>
      </header>
    );
  }
}
