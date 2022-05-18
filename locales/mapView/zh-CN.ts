import component from './zh-CN/component';
import menu from './zh-CN/menu';
import settings from './zh-CN/settings';
import pages from './zh-CN/pages';
import map from './zh-CN/map';

export default {
  'navBar.lang': '语言',
  'layout.user.link.help': '帮助',
  'app.copyright.produced': '深时数字地球版权所有',
  ...pages,
  ...menu,
  ...settings,
  ...component,
  ...map
};
