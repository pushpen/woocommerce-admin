/** @format */
/**
 * External dependencies
 */
import { Component, createElement } from '@wordpress/element';

/**
 * WooCommerce dependencies
 */
import { updateQueryString } from '@woocommerce/navigation';

/**
 * Internal depdencies
 */
import Plugins from './steps/plugins';
import Start from './steps/start/';
import './style.scss';

const getSteps = () => {
	const steps = [];

	steps.push( {
		key: 'start',
		container: Start,
	} );
	steps.push( {
		key: 'plugins',
		container: Plugins,
	} );

	return steps;
};

export default class ProfileWizard extends Component {
	constructor() {
		super( ...arguments );
		this.goToNextStep = this.goToNextStep.bind( this );
	}

	componentDidMount() {
		document.documentElement.classList.remove( 'wp-toolbar' );
		document.body.classList.add( 'woocommerce-profile-wizard__body' );
	}

	componentWillUnmount() {
		document.documentElement.classList.add( 'wp-toolbar' );
		document.body.classList.remove( 'woocommerce-profile-wizard__body' );
	}

	closeWizard() {
		// @todo This should close the wizard and mark the profiler as complete via the API.
	}

	getCurrentStep() {
		const { step } = this.props.query;
		const currentStep = getSteps().find( s => s.key === step );

		if ( ! currentStep ) {
			return getSteps()[ 0 ];
		}

		return currentStep;
	}

	goToNextStep() {
		const currentStep = this.getCurrentStep();
		const currentStepIndex = getSteps().findIndex( s => s.key === currentStep.key );
		const nextStep = getSteps()[ currentStepIndex + 1 ];

		if ( 'undefined' === nextStep ) {
			return this.closeWizard();
		}

		return updateQueryString( { step: nextStep.key } );
	}

	render() {
		const { query } = this.props;
		const step = this.getCurrentStep();

		return createElement( step.container, {
			query,
			step,
			goToNextStep: this.goToNextStep,
		} );
	}
}
