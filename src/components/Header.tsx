import Logo from "../assets/Logo";

export const Header = () => {
  return (
    <div
      data-collapse="medium"
      data-animation="default"
      data-duration="400"
      data-w-id="58db7844-5919-d71b-dd74-2323ed8dffe9"
      data-easing="ease"
      data-easing2="ease"
      role="banner"
      className="header w-nav"
    >
      <div className="container-default container-header w-container">
        <a href="/" className="brand w-nav-brand">
          <Logo width="auto" height="90px" />
        </a>
        <div className="header-right">
          <a href="/create" className="button-primary">
            New Bounty
          </a>
          <a href="/bounties" className="button-primary">
            My bounties
          </a>
          <a href="/bounties" className="button-primary">
            All bounties
          </a>
          <a
            href="/account"
            data-node-type="commerce-cart-open-link"
            className="w-commerce-commercecartopenlink cart-buttno w-inline-block"
          >
            <img
              src="assets/images/noun-wallet-database-763815.png"
              width="50"
              alt="Bag - Jobs Webflow Template"
            />
          </a>
        </div>
      </div>
    </div>
  );
};
