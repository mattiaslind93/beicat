import type { NavigatorScreenParams } from '@react-navigation/native';

import type { StopLocation } from '@/api/resrobot';

export type DeparturesStackParamList = {
  DeparturesHome: undefined;
  StopDetail: { stop: StopLocation };
};

export type RootTabParamList = {
  MapTab: undefined;
  DeparturesTab: NavigatorScreenParams<DeparturesStackParamList>;
  TripTab: undefined;
  DisruptionsTab: undefined;
  MoreTab: undefined;
};
