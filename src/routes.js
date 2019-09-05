import {createAppContainer, createSwitchNavigator} from 'react-navigation';

import main from './pages/main';
import box from './pages/box';

const Routes = createAppContainer(
  createSwitchNavigator({
    main,
    box,
  }),
);

export default Routes;
