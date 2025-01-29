import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Dialog, Modal, Portal, Text } from 'react-native-paper';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { getItemAsync, setItemAsync } from 'expo-secure-store';
import { BackHandler } from 'react-native';

async function PrepareBiometric(showDialog: () => void) {
	const rnBiometrics = new ReactNativeBiometrics();
	const { available } = await rnBiometrics.isSensorAvailable();

	if (!available) {
		showDialog();
		return;
	}
	if (!(await rnBiometrics.biometricKeysExist()).keysExist) {
		const { publicKey } = await rnBiometrics.createKeys();
		await setItemAsync('publicKey', publicKey);
	}
}

enum DoorAction {
	OPEN = 'open',
	STOP = 'stop',
	CLOSE = 'close',
}

async function onPress(doorAction: DoorAction) {
	const rnBiometrics = new ReactNativeBiometrics();
	const { success, signature } = await rnBiometrics.createSignature({
		payload: doorAction,
		promptMessage: '請確認身分',
	});

	if (!success) {
		return;
	}

	const publicKey = await getItemAsync('publicKey');

	await fetch(
		`http://${
			(await getItemAsync('address')) ?? 'http://localhost:3000'
		}/door/${doorAction}`,
		{
			body: JSON.stringify({
				signature,
				action: doorAction,
				publicKey: publicKey,
			}),
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		}
	);
}

export default function Settings() {
	const [visible, setVisible] = useState(false);
	const showDialog = () => setVisible(true);

	useEffect(() => {
		PrepareBiometric(showDialog);
	}, []);

	return (
		<SafeAreaView
			style={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Portal>
				<Dialog visible={visible} dismissable={false}>
					<Dialog.Title>錯誤</Dialog.Title>
					<Dialog.Content>
						<Text variant="bodyMedium">本裝置不支援生物辨識</Text>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={BackHandler.exitApp}>離開</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
			<Button
				mode="contained"
				style={{ marginBottom: 20 }}
				onPress={() => onPress(DoorAction.OPEN)}
			>
				開門
			</Button>
			<Button mode="contained" onPress={() => onPress(DoorAction.CLOSE)}>
				關門
			</Button>
		</SafeAreaView>
	);
}
