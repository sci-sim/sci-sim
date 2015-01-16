
# This is the evaluator for the expressions used to determine if a page/link should be shown,
# and also for evaluating expressions used to update variables.
#
# Abstracted out into a little function here so that we can easily switch between the
# raw, unsafe python eval() call and a to-be-written custom safe and limited evaluator

import string

class ReturnZeroForMissingFormatter(string.Formatter):
    """ This sub-class of the default string formatter returns 0 for unknown fields. """
    def get_value(self, key, args, kwargs):
        try:
            # the next four lines are taken from the cpython source code
            if isinstance(key, int):
                return args[key]
            else:
                return kwargs[key]
        except:
            return 0


def safe_eval(expr):
   """ This is a limited and should be safer version of the raw python eval() function. """
   assert False
   return False


def evaluate_expression(expr, user_vars):
    # Expressions are like "{foo} + 2 * {bar}"

    # First we use the normal string formatting thing to replace the {variables} with their actual value
    rzfmf = ReturnZeroForMissingFormatter()
    formatted_expr = rzfmf.format(expr, **user_vars)

    # Then we eval that mathematic / logical expression
    # TODO someday replace this eval() call with a call to a safer eval function
    result = eval(formatted_expr)
    #eval_expr = safe_eval(formatted_expr)

    return result

