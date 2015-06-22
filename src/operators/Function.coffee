define [
    "nodes"
    "terminals"
    "AlgebraError"
    "parseArgs"
    "require"
    "compare"
    "prettyRender"
], (nodes, terminals, AlgebraError, parseArgs, require, compare, prettyRender) ->

    INV_SUFFIX = "_inv" # Suffix used to represent an inverse function.

    # Node in the expression tree representing a symbolic function.
    class FunctionNode extends nodes.UnaryNode

        # Make a new function node.
        # Arguments passed as the child will be parsed as children from whatever
        # type they are.
        #
        # @param name [String] The name of this function, e.g. "f" in f(x).
        # @param param [Terminal] The independent variable of this function.
        #   This is a general terminal because we also want to be able to write
        #   the function evaluated at some point, e.g. f(1) in addition to f(x).
        # @return [FunctionNode] A new function node.
        constructor: (name, param, args...) ->
            unless param?
                throw new Error("Function nodes must have a dependent variable")
            if args.length > 0
                throw new Error("Function nodes must have no extra arguments")

            unless /[a-zA-Z_]+/.test(name)
                throw new Error("Function name invalid, must be alphanumeric")

            @cmp = -0.5

            super(name, param)

        # Deep-copy this node.
        #
        # @return [FunctionNode] A copy of this node.
        copy: ->
            return new FunctionNode(@label,
                if @child.copy? then @child.copy() else @child)

        # Sort this node in-place.
        sort: ->
            @copy()

        # Check equality between this and another object.
        #
        # @param b [Object] An object to check equality with.
        # @param equivalencies [Object] Optional. A map of variable labels to a
        #   list of equivalent variable labels.
        # @return [Boolean] Whether the objects are equal.
        equals: (b, equivalencies={}) ->
            unless b instanceof FunctionNode
                return false

            if @child.equals?
                unless @child.equals(b.child, equivalencies)
                    return false
            else
                unless @child == b.child
                    return false

            return true

        # Compare this object with another of the same type.
        #
        # @param b [FunctionNode] A function to compare to.
        # @return [Number] The comparison: 1 if this node is greater than the
        #   other, -1 if vice versa, and 0 if they are equal.
        compareSameType: (b) ->
            if @label < b.label
                return -1
            if @label > b.label
                return 1
            return compare(@child, b.child)

        # Map a function over the variables in the child.
        #
        # @param fun [Function] A function to map over variables.
        # @return [FunctionNode] A copy of this node with the given function
        #   mapped over all variables.
        mapOverVariables: (fun) ->
            new FunctionNode(@label, @child.mapOverVariables(fun))

        # Expand this node.
        #
        # @return [FunctionNode] This node, expanded.
        expand: ->
            new FunctionNode(@label, @child.expand())

        # Simplify this node.
        #
        # @param equivalencies [Object] Optional. A map of variable labels to a
        #   list of equivalent variable labels.
        # @return [FunctionNode] This node, simplified.
        simplify: (equivalencies={}) ->
            new FunctionNode(@label, @child.simplify(equivalencies))

        # Expand and then simplify this node.
        #
        # @param equivalencies [Object] Optional. A map of variable labels to a
        #   list of equivalent variable labels.
        # @return [FunctionNode] This node, expanded and simplified.
        expandAndSimplify: (equivalencies={}) ->
            new FunctionNode(@label, @child.expandAndSimplify(equivalencies))

        # Get the inverse of this function.
        #
        # @param param [Terminal] Parameter of the inverse function.
        # @return [FunctionNode] Inverse function.
        inverse: (param=null) ->
            unless param?
                param = @child

            if @label.indexOf(INV_SUFFIX,
                              @label.length - INV_SUFFIX.length) == -1
                # This is not an inverse function, so just invert it.
                return new FunctionNode(@label + INV_SUFFIX,
                                        param.copy())
            else
                # This is an inverse function.
                return new FunctionNode(@label[...-INV_SUFFIX.length],
                                        param.copy())

        # Solve this node for a variable.
        #
        # @param variable [String] The label of the variable to solve for.
        # @param equivalencies [Object] Optional. A map of variable labels to a
        #   list of equivalent variable labels.
        # @return [Array<BasicNode>, Array<Terminal>] The solutions for the
        #   given variable.
        # @throw [AlgebraError] If the node cannot be solved.
        solve: (variable, equivalencies={}) ->
            Add = require("operators/Add")
            Mul = require("operators/Mul")

            # Intuition:
            # Solve f(g(x)) = 0
            # <=> Solve g(x) - f_inv(0) = 0
            inv0 = @inverse(new terminals.Constant("0"))

            return (new Add(@child.copy(), new Mul("-1", inv0))).solve(
                variable, equivalencies)

        # Substitute values into variables.
        #
        # @param substitutions [Object] A map of variable labels to their
        #   values. Values can be any node, terminal, or something interpretable
        #   as a terminal.
        # @param uncertaintySubstitutions [Object] A map of variable labels to
        #   the values of their uncertainties.
        # @param equivalencies [Object] Optional. A map of variable labels to a
        #   list of equivalent variable labels.
        # @param assumeZeroUncertainty [Boolean] Optional. Whether to assume
        #   uncertainties are zero if unknown (default false).
        # @param evaluateSymbolicConstants [Boolean] Optional. Whether to
        #   evaluate symbolic constants (default false).
        # @return [BasicNode, Terminal] This node with all substitutions
        #   substituted.
        sub: (substitutions, uncertaintySubstitutions, equivalencies={},
            assumeZeroUncertainty=false, evaluateSymbolicConstants=false) ->
            new FunctionNode(@label, @child.sub(substitutions,
                uncertaintySubstitutions, equivalencies, assumeZeroUncertainty,
                evaluateSymbolicConstants))

        # Get all variable labels used in children of this node.
        #
        # @return [Array<String>] A list of all labels of variables in children
        #   of this node.
        getAllVariables: ->
            @child.getAllVariables()

        # Replace variable labels.
        #
        # @param replacements [Object] A map of variable labels to their
        #   replacement labels.
        # @return [FunctionNode] This node with variable labels replaced.
        replaceVariables: (replacements) ->
            new FunctionNode(@label, @child.replaceVariables(replacements))

        # Convert this node into a drawing node.
        #
        # @return [DrawingNode] A drawing node representing this node.
        toDrawingNode: ->
            FunctionDN = prettyRender.Function

            return new FunctionDN(@label, @child.toDrawingNode())

        # Get the derivative of this function with respect to its independent
        # variable.
        #
        # @param param [Terminal] Parameter of the derivative. Default @child.
        # @return [FunctionNode] The derivative of this function at param.
        derivative: (param=null) ->
            unless param?
                param = @child
            return new FunctionNode(@label+"'", @child.copy())

        # Differentiate this node with respect to a variable.
        # Since this is a generic function, the derivative is also a generic
        # function, possibly with the chain rule applied.
        #
        # @param variable [String] The label of the variable to differentiate
        #   with respect to.
        # @param equivalencies [Object] Optional. A map of variable labels to a
        #   list of equivalent variable labels.
        # @return [BasicNode] The derivative of this node.
        differentiate: (variable, equivalencies={}) ->
            Mul = require("operators/Mul")

            return (new Mul(@child.differentiate(variable, equivalencies),
                            @derivative())).expandAndSimplify()

        # Check if this node contains a given variable.
        #
        # @param variable [String] The label of the variable to find.
        # @param equivalencies [Object] Optional. A map of variable labels to a
        #   list of equivalent variable labels.
        # @return [Boolean] Whether or not this node contains the given
        #   variable.
        containsVariable: (variable, equivalencies={}) ->
            return @child.containsVariable(variable, equivalencies)

        @approx: ->
            throw new Error("Can't approximate a symbolic function")