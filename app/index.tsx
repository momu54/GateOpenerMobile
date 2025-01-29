import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Dialog, Modal, Portal, Text } from 'react-native-paper';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { useEffect, useState } from 'react';
import { fetch } from 'expo/fetch';
import { getItemAsync, setItemAsync } from 'expo-secure-store';
import { BackHandler } from 'react-native';
import { FetchResponse } from 'expo/build/winter/fetch/FetchResponse';

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
const ErrorMessageMap = {
	[401]: 'Unauthorized',
	[404]: 'Not Found',
	[409]: 'Key already exists',
	[405]: 'Method Not Allowed',
};

async function onPress(
	doorAction: DoorAction,
	setErrorMessage: (message: string) => void,
	showErrorDialog: () => void
) {
	const rnBiometrics = new ReactNativeBiometrics();
	const { success, signature } = await rnBiometrics.createSignature({
		payload: doorAction,
		promptMessage: '請確認身分',
	});

	if (!success) {
		return;
	}
	const publicKey = await getItemAsync('publicKey');
	const response = await fetch(
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
	if (!response.ok) {
		setErrorMessage(
			ErrorMessageMap[response.status as keyof typeof ErrorMessageMap] ??
				'Unknown error'
		);
		showErrorDialog();
	}
}

export default function Settings() {
	const [noBiometricDialogvisible, setNoBiometricDialogVisible] = useState(false);
	const [requestFailedDialogVisible, setRequestFailedDialogVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState('Unknown error');
	const showNoBiometricDialog = () => setNoBiometricDialogVisible(true);
	const showRequestFailedDialog = () => setRequestFailedDialogVisible(true);

	useEffect(() => {
		PrepareBiometric(showNoBiometricDialog);
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
				<Dialog visible={noBiometricDialogvisible} dismissable={false}>
					<Dialog.Title>錯誤</Dialog.Title>
					<Dialog.Content>
						<Text variant="bodyMedium">本裝置不支援生物辨識</Text>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={BackHandler.exitApp}>離開</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
			<Portal>
				<Dialog visible={requestFailedDialogVisible} dismissable>
					<Dialog.Title>錯誤</Dialog.Title>
					<Dialog.Content>
						<Text variant="bodyMedium">{errorMessage}</Text>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setRequestFailedDialogVisible(false)}>
							關閉
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
			<Button
				mode="contained"
				style={{ marginBottom: 20 }}
				onPress={() =>
					onPress(DoorAction.OPEN, setErrorMessage, showRequestFailedDialog)
				}
			>
				開門
			</Button>
			<Button
				mode="contained"
				onPress={() =>
					onPress(DoorAction.CLOSE, setErrorMessage, showRequestFailedDialog)
				}
			>
				關門
			</Button>
		</SafeAreaView>
	);
}
