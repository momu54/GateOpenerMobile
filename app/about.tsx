import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Title } from 'react-native-paper';
import { Image } from 'react-native';
import { getDeviceId, getVersion } from 'react-native-device-info';
const avatorSize = 200;
const avatorSource = require('@/assets/images/avator.png');

export default function About() {
	return (
		<SafeAreaView
			style={{
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<Image
				source={avatorSource}
				style={{
					width: avatorSize,
					height: avatorSize,
					borderRadius: avatorSize / 2,
				}}
			/>
			<Title style={{ padding: 10 }}>芝麻開門</Title>
			<Text>V {getVersion()}</Text>
			<Text>{getDeviceId()}</Text>
		</SafeAreaView>
	);
}
