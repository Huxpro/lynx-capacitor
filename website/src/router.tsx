import { Fragment, h } from '@stencil/core';
import {
  Route,
  createStaticRouter,
  staticState,
  match,
  matchAny,
} from '@stencil/router';
import { getPage } from './data.server/prismic';
import { getDocsDataV3 } from './data.server/docs-v3';
import { getBlogData, getAllBlogData } from './data.server/blog';
import { getDocsDataV2 } from './data.server/docs-v2';

export const Router = createStaticRouter();

export default Router;

export const Routes = () => (
  <Router.Switch>
    <Route
      path="/"
      mapParams={staticState(getPage)}
      render={(_, data) => (
        <Fragment>
          <site-header class="heading-container" sticky={true} />
          <landing-page data={data} />
        </Fragment>
      )}
    />

    <Route
      path={match('/blog', { exact: true })}
      mapParams={staticState(getAllBlogData)}
      render={(_, data) => (
        <Fragment>
          <site-header class="heading-container" sticky={true} />
          <blog-page data={data} />
        </Fragment>
      )}
    ></Route>

    <Route
      path={match('/blog/:slug*')}
      mapParams={staticState(getBlogData)}
      render={(_, data) => (
        <Fragment>
          <site-header class="heading-container" sticky={true} />
          <blog-post data={data} />
        </Fragment>
      )}
    />

    <Route
      path="/community"
      mapParams={staticState(getPage)}
      render={(_, data) => (
        <Fragment>
          <site-header class="heading-container" sticky={true} />
          <community-page data={data} />
        </Fragment>
      )}
    />

    <Route
      path="/telemetry"
      mapParams={staticState(getPage)}
      render={(_, data) => (
        <Fragment>
          <site-header class="heading-container" sticky={true} />
          <telemetry-page />
        </Fragment>
      )}
    />

    <Route
      path="/cordova"
      mapParams={staticState(getPage)}
      render={(_, data) => (
        <Fragment>
          <cordova-page />
        </Fragment>
      )}
    />

    <Route
      path="/enterprise"
      mapParams={staticState(getPage)}
      render={(_, data) => (
        <Fragment>
          <site-header class="heading-container" theme="dark" sticky={false} />
          <enterprise-page data={data} />
        </Fragment>
      )}
    />

    <Route
      path={matchAny(['/docs/v2/:id*', '/docs/v2'])}
      mapParams={staticState(getDocsDataV2)}
      render={(_, data) => (
        <Fragment>
          <docs-component data={data} />
        </Fragment>
      )}
    />

    <Route
      path={matchAny(['/docs/v3/:id*', '/docs/v3', '/docs/:id*', '/docs'])}
      mapParams={staticState(getDocsDataV3)}
      render={(_, data) => (
        <Fragment>
          <docs-component data={data} />
        </Fragment>
      )}
    />

    <Route
      path={match('/solution/:solutionId*')}
      mapParams={staticState(getPage)}
      render={(params, data) => (
        <Fragment>
          <site-header class="heading-container" />
          <solution-page solutionId={params.solutionId} />
        </Fragment>
      )}
    />
  </Router.Switch>
);

Router.on('change', (_newUrl, _oldUrl) => {
  // if (!oldUrl || oldUrl.pathname !== newUrl.pathname) {
  //   state.isLeftSidebarIn = false;
  //   state.showTopBar = true;
  //   state.pageTheme = 'light';
  // }
  // Reset scroll position
  // requestAnimationFrame(() => window.scrollTo(0, 0));
  // if (newUrl.hash) {
  //   const id = newUrl.hash.slice(1);
  //   setTimeout(() => {
  //     const el = document.getElementById(id);
  //     if (el) {
  //       el.scrollIntoView && el.scrollIntoView();
  //     }
  //   }, 50);
  // }
});

const docsPath = '/docs';
const versionedDocsPath = '/docs/v2';

export const docsVersionHref = (path: string) => {
  if (
    Router.path.startsWith(versionedDocsPath) &&
    !path.startsWith(versionedDocsPath)
  ) {
    return path.replace(docsPath, versionedDocsPath);
  }
  return path;
};
