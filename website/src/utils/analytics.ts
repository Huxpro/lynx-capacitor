export const trackClick = (
  eventId: string,
  event?: MouseEvent,
  location: string = 'Capacitor Site',
) => {
  const timeForTrackingRequests = 150; // ms
  if (event) {
    event.preventDefault();
  }

  hubspotTrack('Click', eventId, location);
  googleAnalyticsTrack('Click', eventId, location);

  // give tracking request time to complete
  setTimeout(() => {
    const link = hrefClimber(event?.target as Node);
    if (link.target && link.target.toLowerCase() === '_blank') {
      window.open(link.href);
    } else if (link.href) {
      document.location = link.href;
    }
  }, timeForTrackingRequests);
};

const hubspotTrack = (
  type: 'Click' | 'View',
  eventId: string,
  location: string,
) => {
  const _hsq = ((window as any)._hsq = (window as any)._hsq || []);
  _hsq.push([
    'trackEvent',
    {
      id: `${location} Event - ${type} - ${eventId}`,
    },
  ]);
};

const googleAnalyticsTrack = (
  type: 'Click' | 'View',
  eventId: string,
  location: string,
) => {
  if (!(window as any)['gtag']) {
    console.warn(
      'Unable to track Google Analytics event, gtag not found',
      type,
      eventId,
    );
    return;
  }

  (window as any)['gtag']('event', `${type} - ${eventId}`, {
    event_category: `${location} - ${type}`,
    event_label: eventId,
  });
};

// recursive function to climb the DOM looking for href tags
const hrefClimber = (el: any): any => {
  if (el['href']) {
    return el;
  } else if (el.parentNode) {
    return hrefClimber(el.parentNode);
  }
};
