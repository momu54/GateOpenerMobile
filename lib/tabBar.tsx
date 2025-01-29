import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Vibration } from 'react-native';
import { BottomNavigation, Text } from 'react-native-paper';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContext } from '@react-navigation/native';

const CenterLabel = ({ color, children }: { color: string; children?: string }) =>
	children ? (
		<Text
			style={{
				color,
				textAlign: 'center',
				height: 24,
				fontSize: 12,
			}}
		>
			{children}
		</Text>
	) : undefined;
export default function TabBar({ state, navigation, descriptors }: BottomTabBarProps) {
	return (
		<BottomNavigation.Bar
			navigationState={state}
			onTabPress={({ route, preventDefault }) => {
				const event = navigation.emit({
					type: 'tabPress',
					target: route.key,
					canPreventDefault: true,
				});
				Vibration.vibrate(1);

				if (event.defaultPrevented) {
					preventDefault();
				} else {
					navigation.navigate(route.name);
				}
			}}
			renderIcon={({ route, focused, color }) => {
				const { options } = descriptors[route.key];
				return options.tabBarIcon?.({ focused, color, size: 24 }) ?? null;
			}}
			renderLabel={({ route, focused, color }) => {
				const { options } = descriptors[route.key];

				const label = (typeof options.tabBarLabel === 'string' ? (
					<CenterLabel color={color}>{options.tabBarLabel}</CenterLabel>
				) : (
					options.tabBarLabel?.({
						focused,
						color,
						position: 'below-icon',
						children: '',
					})
				)) ?? <CenterLabel color={color}>{options.title}</CenterLabel> ?? (
						<CenterLabel color={color}>{route.name}</CenterLabel>
					);

				return label;
			}}
			getBadge={({ route }) => {
				const { options } = descriptors[route.key];
				return options.tabBarBadge;
			}}
			keyboardHidesNavigationBar={false}
		/>
	);
}
