import {
	DarkTheme as NavDarkTheme,
	DefaultTheme as NavDefaultTheme,
	ThemeProvider,
} from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import {
	PaperProvider,
	MD3LightTheme,
	MD3DarkTheme,
	adaptNavigationTheme,
} from 'react-native-paper';
import TabBar from '@/lib/tabBar';
import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { SystemBars } from 'react-native-edge-to-edge';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const TabBarIcon = (props: {
	name: ComponentProps<typeof MaterialIcons>['name'];
	color: string;
	focused: boolean;
}) => <MaterialIcons size={24} style={{}} {...props} />;

export default function RootLayout() {
	const colorScheme = useColorScheme();

	const AdaptedNavTheme = adaptNavigationTheme({
		reactNavigationLight: NavDefaultTheme,
		reactNavigationDark: NavDarkTheme,
	});
	const { theme: MD3Color } = useMaterial3Theme();

	const CombinedDefaultTheme = {
		...AdaptedNavTheme.LightTheme,
		...MD3LightTheme,
		colors: {
			...NavDefaultTheme.colors,
			...MD3LightTheme.colors,
			...MD3Color.light,
		},
		fonts: {
			...NavDarkTheme.fonts,
			...MD3DarkTheme.fonts,
		},
	};

	const CombinedDarkTheme = {
		...AdaptedNavTheme.DarkTheme,
		...MD3DarkTheme,
		colors: {
			...NavDarkTheme.colors,
			...MD3DarkTheme.colors,
			...MD3Color.dark,
		},
		fonts: {
			...NavDarkTheme.fonts,
			...MD3DarkTheme.fonts,
		},
	};

	const CurrentTheme =
		colorScheme === 'dark' ? CombinedDarkTheme : CombinedDefaultTheme;

	return (
		<ThemeProvider value={CurrentTheme}>
			<SafeAreaProvider>
				<PaperProvider theme={CurrentTheme}>
					<SystemBars />
					<Tabs
						tabBar={TabBar}
						screenOptions={{
							headerShown: false,
						}}
					>
						<Tabs.Screen
							name="index"
							options={{
								title: 'Home',
								tabBarIcon: (iconProps) => (
									<TabBarIcon name="home" {...iconProps} />
								),
								tabBarLabel: '首頁',
							}}
						/>
						<Tabs.Screen
							name="settings"
							options={{
								title: 'Settings',
								tabBarIcon: (iconProps) => (
									<TabBarIcon name="settings" {...iconProps} />
								),
								tabBarLabel: '設定',
								tabBarBadge: 2,
							}}
						/>
						<Tabs.Screen
							name="about"
							options={{
								title: 'About',
								tabBarIcon: (iconProps) => (
									<TabBarIcon name="info" {...iconProps} />
								),
								tabBarLabel: '關於',
							}}
						/>
						<Tabs.Screen
							name="+not-found"
							options={{
								tabBarLabel: '_Not_Found_',
								tabBarIcon: (iconProps) => (
									<TabBarIcon name="cancel" {...iconProps} />
								),
							}}
							redirect={!__DEV__}
						/>
						<Tabs.Screen
							name="_sitemap"
							options={{
								title: '_sitemap_',
								tabBarIcon: (iconProps) => (
									<TabBarIcon name="build" {...iconProps} />
								),
							}}
							redirect={!__DEV__}
						/>
					</Tabs>
				</PaperProvider>
			</SafeAreaProvider>
		</ThemeProvider>
	);
}
