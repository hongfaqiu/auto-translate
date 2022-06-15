import component from './en-US/component';
import menu from './en-US/menu';
import pages from './en-US/pages';
import map from './en-US/map';

export default {
  'navBar.lang': 'Languages',
  'layout.user.link.help': 'Help',
  'app.copyright.produced': 'Deep-time Digital Earth All rights reserved',
  'site.title': 'Earth Explore(Alpha)',
  ...menu,
  ...component,
  ...pages,
  ...map
};
