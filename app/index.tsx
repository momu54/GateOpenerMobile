import { SafeAreaView } from 'react-native-safe-area-context';
import {
	Button,
	Dialog,
	IconButton,
	Modal,
	Portal,
	Text,
	useTheme,
} from 'react-native-paper';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { useEffect, useState } from 'react';
import { fetch } from 'expo/fetch';
import { getItemAsync, setItemAsync } from 'expo-secure-store';
import { BackHandler } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ResultMessage } from '@/lib/typing';

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
	OPEN = 'OPEN',
	STOP = 'STOP',
	CLOSE = 'CLOSE',
}

async function onPress(
	doorAction: DoorAction,
	setResultMessage: (resultMessage: ResultMessage) => void,
	showResultDialog: () => void
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
	const address = await getItemAsync('address');
	if (!address) {
		setResultMessage({
			status: 'failed',
			message: 'Address not set',
		});
		showResultDialog();
		return;
	}
	const response = await fetch(`${address}/gate`, {
		body: JSON.stringify({
			signature,
			action: doorAction,
			publicKey: publicKey,
		}),
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
	});
	const jsonResponse: ResultMessage = await response.json().catch(() => ({
		status: 'failed',
		message: 'Unknown error',
	}));
	setResultMessage(jsonResponse);
	showResultDialog();
}

export default function Settings() {
	const [noBiometricDialogvisible, setNoBiometricDialogVisible] = useState(false);
	const [resultMessageVisible, setResultMessageVisible] = useState(false);
	const [resultMessage, setResultMessage] = useState<ResultMessage>({
		status: 'failed',
		message: 'Unknown error',
	});
	const showNoBiometricDialog = () => setNoBiometricDialogVisible(true);
	const showRequestFailedDialog = () => setResultMessageVisible(true);
	const { colors } = useTheme();

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
				<Dialog visible={resultMessageVisible} dismissable>
					<Dialog.Title>
						{resultMessage.status === 'success' ? '成功' : '錯誤'}
					</Dialog.Title>
					<Dialog.Content>
						<Text variant="bodyMedium">{resultMessage.message}</Text>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setResultMessageVisible(false)}>
							關閉
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
			<IconButton
				mode="contained"
				containerColor={colors.primary}
				size={64}
				icon={() => (
					<MaterialIcons
						name="arrow-circle-up"
						size={48}
						color={colors.onPrimary}
					/>
				)}
				onPress={() =>
					onPress(DoorAction.OPEN, setResultMessage, showRequestFailedDialog)
				}
				style={{ marginBottom: 10 }}
			/>
			<IconButton
				mode="contained"
				containerColor={colors.primary}
				size={64}
				icon={() => (
					<MaterialIcons
						name="stop-circle"
						size={48}
						color={colors.onPrimary}
					/>
				)}
				onPress={() =>
					onPress(DoorAction.STOP, setResultMessage, showRequestFailedDialog)
				}
				style={{ marginBottom: 10 }}
			/>
			<IconButton
				mode="contained"
				containerColor={colors.primary}
				size={64}
				icon={() => (
					<MaterialIcons
						name="arrow-circle-down"
						size={48}
						color={colors.onPrimary}
					/>
				)}
				onPress={() =>
					onPress(DoorAction.CLOSE, setResultMessage, showRequestFailedDialog)
				}
			/>
		</SafeAreaView>
	);
}
